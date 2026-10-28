import 'server-only';

import { db, Op } from '@dg/db';
import type { MusicTrackPopularitySource } from '@dg/db/models/MusicTrackPopularity';
import { calendarDayKey, SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchDeezerTrack } from './fetchTrackBpm';
import { select } from './listeningStatsQueries';
import {
  type PopularityFailure,
  readPopularityPause,
  recordPopularityOutcome,
} from './popularityBackoff';
import { mapInBatches, sleep, spotifyGet } from './trackMetadataShared';

/** Spotify's Get Several Tracks endpoint accepts at most this many ids per call. */
const SPOTIFY_TRACKS_PER_CALL = 50;
const SPOTIFY_CALL_THROTTLE_MS = 150;
/** Deezer ranks run 0–1,000,000; dividing by this puts them on Spotify's 0–100 scale. */
const DEEZER_RANK_PER_POINT = 10_000;
/** Tracks with no snapshot yet that each history sync fills in, a few calls' worth. */
const POPULARITY_BACKFILL_PER_SYNC = 200;

const severalTracksSchema = v.looseObject({
  tracks: v.array(
    v.nullable(
      v.looseObject({
        external_ids: v.optional(v.looseObject({ isrc: v.optional(v.string()) })),
        id: v.string(),
        popularity: v.optional(v.nullable(v.number())),
      }),
    ),
  ),
});

type PopularityRow = {
  capturedOn: string;
  popularity: number;
  source: MusicTrackPopularitySource;
  trackId: string;
};

export type PopularityCapture = {
  deezer: number;
  /** Set when a refused Spotify call or a thrown error stopped the run early. */
  failure?: PopularityFailure;
  /** Tracks the run never reached because it stopped early. */
  remaining: Array<string>;
  spotify: number;
  /** Tracks looked up that neither Spotify nor Deezer could score. */
  unmatched: number;
};

function toPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function deezerRankToPopularity(rank: unknown): number | null {
  if (typeof rank !== 'number' || !Number.isFinite(rank) || rank < 0) {
    return null;
  }
  return toPercent(rank / DEEZER_RANK_PER_POINT);
}

function chunk<T>(items: ReadonlyArray<T>, size: number): Array<Array<T>> {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function readUncapturedIds(
  trackIds: ReadonlyArray<string>,
  capturedOn: string,
): Promise<Array<string>> {
  const unique = [...new Set(trackIds)];
  if (unique.length === 0) {
    return [];
  }
  const captured = await db.MusicTrackPopularity.findAll({
    attributes: ['trackId'],
    where: { capturedOn, trackId: { [Op.in]: unique } },
  });
  const capturedIds = new Set(captured.map((row) => row.trackId));
  return unique.filter((id) => !capturedIds.has(id));
}

async function scoreTracks(
  tracks: ReadonlyArray<v.InferOutput<typeof severalTracksSchema>['tracks'][number]>,
  capturedOn: string,
): Promise<{ deezer: Array<PopularityRow>; spotify: Array<PopularityRow> }> {
  const spotify: Array<PopularityRow> = [];
  const deezerMisses: Array<{ isrc: string; trackId: string }> = [];
  for (const track of tracks.filter(isNotNullish)) {
    if (typeof track.popularity === 'number') {
      spotify.push({
        capturedOn,
        popularity: toPercent(track.popularity),
        source: 'spotify',
        trackId: track.id,
      });
    } else if (track.external_ids?.isrc) {
      deezerMisses.push({ isrc: track.external_ids.isrc, trackId: track.id });
    }
  }
  const deezer = await mapInBatches(deezerMisses, async ({ isrc, trackId }) => {
    const popularity = deezerRankToPopularity((await fetchDeezerTrack(isrc))?.rank);
    return popularity === null
      ? null
      : { capturedOn, popularity, source: 'deezer' as const, trackId };
  });
  return { deezer, spotify };
}

/**
 * Stores today's (Pacific) popularity for each track, one batched Spotify
 * `/tracks` call per 50 tracks. Tracks Spotify returns without a popularity fall
 * back to Deezer's rank by ISRC. Tracks already captured today are skipped.
 * Each call's rows are written before the next call, so a refused call or a
 * thrown error keeps everything scored so far and reports the tracks it never
 * reached. Never throws, since a missing snapshot only thins the popularity chart.
 */
export async function captureTrackPopularity(
  trackIds: ReadonlyArray<string>,
  capturedAt: Date = new Date(),
): Promise<PopularityCapture> {
  const capturedOn = calendarDayKey(capturedAt.getTime(), SITE_TIME_ZONE);
  const capture: PopularityCapture = {
    deezer: 0,
    remaining: [...new Set(trackIds)],
    spotify: 0,
    unmatched: 0,
  };
  try {
    const calls = chunk(await readUncapturedIds(trackIds, capturedOn), SPOTIFY_TRACKS_PER_CALL);
    capture.remaining = calls.flat();
    for (const [index, ids] of calls.entries()) {
      if (index > 0) {
        await sleep(SPOTIFY_CALL_THROTTLE_MS);
      }
      const result = await spotifyGet(
        `tracks?ids=${ids.join(',')}`,
        severalTracksSchema,
        'track popularity',
      );
      if (!result.success) {
        log.warn('Spotify refused a track popularity batch', {
          error: result.error,
          retryAfterSeconds: result.retryAfterSeconds,
        });
        capture.failure = {
          status: result.status,
          ...(result.retryAfterSeconds === undefined
            ? {}
            : { retryAfterSeconds: result.retryAfterSeconds }),
        };
        return capture;
      }
      const { deezer, spotify } = await scoreTracks(result.data.tracks, capturedOn);
      await db.MusicTrackPopularity.bulkCreate([...spotify, ...deezer], { ignoreDuplicates: true });
      capture.deezer += deezer.length;
      capture.spotify += spotify.length;
      capture.unmatched += Math.max(0, ids.length - spotify.length - deezer.length);
      capture.remaining = capture.remaining.slice(ids.length);
    }
    return capture;
  } catch (error) {
    log.warn('Could not capture track popularity', { error, remaining: capture.remaining.length });
    return { ...capture, failure: {} };
  }
}

/** A capture's counts for logs, without the remaining track ids. */
export function summarizeCapture({ failure, remaining, ...counts }: PopularityCapture) {
  return { ...counts, failure, remaining: remaining.length };
}

/**
 * Played tracks that have no popularity snapshot from any source. Shuffled so a
 * track neither Spotify nor Deezer can score never blocks the rest.
 */
export async function selectTracksMissingPopularity(limit?: number): Promise<Array<string>> {
  const rows = await select(
    `SELECT p."trackId" FROM "SpotifyPlay" p
     WHERE NOT EXISTS (SELECT 1 FROM "MusicTrackPopularity" m WHERE m."trackId" = p."trackId")
     GROUP BY p."trackId"
     ORDER BY random()
     ${limit === undefined ? '' : 'LIMIT :limit'}`,
    v.object({ trackId: v.string() }),
    limit === undefined ? undefined : { limit },
  );
  return rows.map((row) => row.trackId);
}

/**
 * The history sync's popularity step: today's popularity for the tracks it just
 * synced, then a slice of never-scored tracks, whose older plays read that score
 * as "current popularity". A refusal ends the step, and later syncs skip it
 * until Spotify's Retry-After (or a jittered pause that doubles with each
 * refused run) has passed.
 */
export async function captureSyncedPopularity(trackIds: ReadonlyArray<string>): Promise<void> {
  try {
    const pausedUntil = await readPopularityPause();
    if (pausedUntil) {
      log.info('Skipping track popularity while Spotify backs off', { pausedUntil });
      return;
    }
    const captured = await captureTrackPopularity(trackIds);
    const backfilled = captured.failure
      ? null
      : await captureTrackPopularity(
          await selectTracksMissingPopularity(POPULARITY_BACKFILL_PER_SYNC),
        );
    await recordPopularityOutcome(captured.failure ?? backfilled?.failure);
    log.info('Spotify track popularity captured', {
      backfilled: backfilled && summarizeCapture(backfilled),
      captured: summarizeCapture(captured),
    });
  } catch (error) {
    log.warn('Could not capture synced track popularity', { error });
  }
}
