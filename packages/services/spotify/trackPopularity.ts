import 'server-only';

import { db, Op } from '@dg/db';
import type { MusicTrackPopularitySource } from '@dg/db/models/MusicTrackPopularity';
import { calendarDayKey, SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchDeezerTrack } from './fetchTrackBpm';
import { select } from './listeningStatsQueries';
import { mapInBatches, sleep, spotifyGet } from './trackMetadataShared';

/** Spotify's Get Several Tracks endpoint accepts at most this many ids per call. */
const SPOTIFY_TRACKS_PER_CALL = 50;
const SPOTIFY_CALL_THROTTLE_MS = 150;
/** Deezer ranks run 0–1,000,000; dividing by this puts them on Spotify's 0–100 scale. */
const DEEZER_RANK_PER_POINT = 10_000;
/** Tracks with no snapshot yet that each history sync fills in, a few calls' worth. */
export const POPULARITY_BACKFILL_PER_SYNC = 200;

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
  /** Set when Spotify refused a call, so the remaining tracks wait for a later run. */
  retryAfterSeconds?: number;
  spotify: number;
  stoppedEarly: boolean;
};

const EMPTY_CAPTURE: PopularityCapture = { deezer: 0, spotify: 0, stoppedEarly: false };

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

async function readDeezerPopularity(
  misses: ReadonlyArray<{ isrc: string; trackId: string }>,
  capturedOn: string,
): Promise<Array<PopularityRow>> {
  return await mapInBatches(misses, async ({ isrc, trackId }) => {
    const popularity = deezerRankToPopularity((await fetchDeezerTrack(isrc))?.rank);
    return popularity === null ? null : { capturedOn, popularity, source: 'deezer', trackId };
  });
}

/**
 * Stores today's (Pacific) popularity for each track, one batched Spotify
 * `/tracks` call per 50 tracks. Tracks Spotify returns without a popularity fall
 * back to Deezer's rank by ISRC. Tracks already captured today are skipped, and
 * a refused Spotify call stops the run so the rest are picked up next time.
 * Never throws, since a missing snapshot only thins the popularity chart.
 */
export async function captureTrackPopularity(
  trackIds: ReadonlyArray<string>,
  capturedAt: Date = new Date(),
): Promise<PopularityCapture> {
  const capturedOn = calendarDayKey(capturedAt.getTime(), SITE_TIME_ZONE);
  try {
    const pending = await readUncapturedIds(trackIds, capturedOn);
    const spotifyRows: Array<PopularityRow> = [];
    const deezerMisses: Array<{ isrc: string; trackId: string }> = [];
    let refused: { retryAfterSeconds?: number } | null = null;

    for (const [index, ids] of chunk(pending, SPOTIFY_TRACKS_PER_CALL).entries()) {
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
        refused = { retryAfterSeconds: result.retryAfterSeconds };
        break;
      }
      for (const track of result.data.tracks.filter(isNotNullish)) {
        if (typeof track.popularity === 'number') {
          spotifyRows.push({
            capturedOn,
            popularity: toPercent(track.popularity),
            source: 'spotify',
            trackId: track.id,
          });
        } else if (track.external_ids?.isrc) {
          deezerMisses.push({ isrc: track.external_ids.isrc, trackId: track.id });
        }
      }
    }

    const deezerRows = await readDeezerPopularity(deezerMisses, capturedOn);
    await db.MusicTrackPopularity.bulkCreate([...spotifyRows, ...deezerRows], {
      ignoreDuplicates: true,
    });
    return {
      deezer: deezerRows.length,
      spotify: spotifyRows.length,
      stoppedEarly: refused !== null,
      ...(refused?.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: refused.retryAfterSeconds }
        : {}),
    };
  } catch (error) {
    log.warn('Could not capture track popularity', { error, tracks: trackIds.length });
    return { ...EMPTY_CAPTURE, stoppedEarly: true };
  }
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
 * Gives a slice of never-scored tracks today's popularity. Their older plays
 * then read that score as "current popularity", which the chart labels as such.
 */
export async function backfillTrackPopularity(
  limit = POPULARITY_BACKFILL_PER_SYNC,
): Promise<PopularityCapture> {
  try {
    return await captureTrackPopularity(await selectTracksMissingPopularity(limit));
  } catch (error) {
    log.warn('Could not backfill track popularity', { error });
    return { ...EMPTY_CAPTURE, stoppedEarly: true };
  }
}
