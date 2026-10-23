import 'server-only';

import {
  mapRecentlyPlayedFromApi,
  recentlyPlayedApiSchema,
} from '@dg/content-models/spotify/RecentlyPlayed';
import { db, Op } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import { parseResponse } from '../clients/parseResponse';
import { getSpotifyClient } from './spotifyClient';
import type { TrackMetadata } from './trackMetadataShared';

/**
 * Maximum tracks Spotify returns from recently-played endpoint.
 * This is NOT pagination - Spotify only keeps the last 50 tracks in history.
 */
const SPOTIFY_HISTORY_LIMIT = 50;

type SpotifyPlayRow = TrackMetadata & {
  playedAt: Date;
  trackId: string;
};

export class SpotifyHistoryUnavailableError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | undefined;

  constructor(status: number, retryAfterSeconds: number | undefined) {
    super(
      `Spotify recently-played read failed with status ${status}${
        retryAfterSeconds === undefined ? '' : ` (retry after ${retryAfterSeconds}s)`
      }`,
    );
    this.name = 'SpotifyHistoryUnavailableError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.status = status;
  }
}

async function fetchRecentPlays(afterTimestamp?: number): Promise<Array<SpotifyPlayRow>> {
  const params = new URLSearchParams({ limit: String(SPOTIFY_HISTORY_LIMIT) });
  if (afterTimestamp) {
    params.set('after', String(afterTimestamp));
  }

  const resource = `me/player/recently-played?${params.toString()}`;
  const { response, retryAfterSeconds, status } = await getSpotifyClient().get(resource);

  if (status !== 200) {
    throw new SpotifyHistoryUnavailableError(status, retryAfterSeconds);
  }

  const json = await response.json();

  const data = parseResponse(recentlyPlayedApiSchema, json, {
    kind: 'rest',
    source: 'spotify.syncHistory',
  });

  const mapped = mapRecentlyPlayedFromApi(data);

  if (data.items.length > 0 && mapped.items.length === 0) {
    throw new Error(
      `Spotify returned ${data.items.length} plays but none could be mapped; the payload shape likely changed`,
    );
  }
  if (mapped.items.length < data.items.length) {
    log.warn('Dropped unmappable Spotify plays', {
      dropped: data.items.length - mapped.items.length,
      received: data.items.length,
    });
  }

  return mapped.items.map((item) => ({
    albumId: item.track.album.id,
    artistIds: item.track.artists.map((artist) => artist.id),
    playedAt: new Date(item.playedAt),
    trackId: item.track.id,
  }));
}

export async function getLatestPlayedAt(): Promise<Date | null> {
  const latest = await db.SpotifyPlay.findOne({
    attributes: ['playedAt'],
    order: [['playedAt', 'DESC']],
  });
  return latest?.playedAt ?? null;
}

type SyncPlaysOptions = {
  knownLatestPlayedAt?: Date | null;
};

export async function syncSpotifyPlaysSince(options?: SyncPlaysOptions): Promise<{
  inserted: number;
  total: number;
  gapDetected: boolean;
}> {
  const latestPlayedAt =
    options?.knownLatestPlayedAt !== undefined
      ? options.knownLatestPlayedAt
      : await getLatestPlayedAt();

  log.info('Syncing Spotify plays', {
    since: latestPlayedAt?.toISOString() ?? null,
  });

  const plays = await fetchRecentPlays(latestPlayedAt?.getTime());

  if (plays.length === 0) {
    log.info('No new Spotify plays to sync');
    return { gapDetected: false, inserted: 0, total: 0 };
  }

  const gapDetected = latestPlayedAt !== null && plays.length === SPOTIFY_HISTORY_LIMIT;
  if (gapDetected) {
    log.warn(
      'Potential data gap detected - Spotify returned max 50 tracks. Some plays may have been lost.',
    );
  }

  // Count this batch's primary keys before and after insert
  // (bulkCreate with ignoreDuplicates doesn't reliably set isNewRecord).
  // Scoping to the batch keeps other writers to the table out of the delta.
  const batchKeys = {
    [Op.or]: plays.map(({ playedAt, trackId }) => ({ playedAt, trackId })),
  };
  const countBefore = await db.SpotifyPlay.count({ where: batchKeys });

  await db.SpotifyPlay.bulkCreate(plays, {
    ignoreDuplicates: true,
  });

  const countAfter = await db.SpotifyPlay.count({ where: batchKeys });
  const inserted = countAfter - countBefore;
  log.info('Spotify plays synced', {
    gapDetected,
    inserted,
    total: plays.length,
  });

  return { gapDetected, inserted, total: plays.length };
}

type SyncContext = 'backfill' | 'cron';

type SyncWithLoggingOptions = {
  context: SyncContext;
  failureLogLevel?: 'error' | 'warn';
  knownLatestPlayedAt?: Date | null;
};

type SpotifySyncOutcome =
  | {
      gapDetected: boolean;
      inserted: number;
      status: 'ok';
      total: number;
    }
  | {
      reason: string;
      retryAfterSeconds?: number;
      status: 'failed';
    };

const getContextLabel = (context: SyncContext) => (context === 'cron' ? 'Cron' : 'Backfill');

export async function syncSpotifyHistoryWithLogging({
  context,
  failureLogLevel = 'error',
  knownLatestPlayedAt,
}: SyncWithLoggingOptions): Promise<SpotifySyncOutcome> {
  try {
    const result = await syncSpotifyPlaysSince({ knownLatestPlayedAt });
    log.info(`${getContextLabel(context)}: Spotify history sync complete`, result);
    return { ...result, status: 'ok' };
  } catch (error) {
    log[failureLogLevel](`${getContextLabel(context)}: Spotify history sync failed`, {
      error: serializeError(error as Error),
    });
    return {
      reason: error instanceof Error ? error.message : 'Unknown Spotify history sync failure',
      retryAfterSeconds:
        error instanceof SpotifyHistoryUnavailableError ? error.retryAfterSeconds : undefined,
      status: 'failed',
    };
  }
}
