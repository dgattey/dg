import 'server-only';

import {
  mapRecentlyPlayedFromApi,
  recentlyPlayedApiSchema,
} from '@dg/content-models/spotify/RecentlyPlayed';
import { db } from '@dg/db';
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

/**
 * A play record ready for database insertion.
 * Extends TrackMetadata with the play-specific fields.
 */
type SpotifyPlayRow = TrackMetadata & {
  playedAt: Date;
  trackId: string;
};

/**
 * Fetches recently played tracks from Spotify.
 *
 * IMPORTANT: Spotify only returns the 50 most recent tracks total.
 * This is NOT pagination - once 50 new tracks play, older ones are gone forever.
 */
async function fetchRecentPlays(afterTimestamp?: number): Promise<Array<SpotifyPlayRow>> {
  const params = new URLSearchParams({ limit: String(SPOTIFY_HISTORY_LIMIT) });
  if (afterTimestamp) {
    params.set('after', String(afterTimestamp));
  }

  const resource = `me/player/recently-played?${params.toString()}`;
  const { response, status } = await getSpotifyClient().get(resource);

  if (status !== 200) {
    log.warn('Spotify recently-played fetch failed', { status });
    return [];
  }

  const json = await response.json();

  const data = parseResponse(recentlyPlayedApiSchema, json, {
    kind: 'rest',
    source: 'spotify.syncHistory',
  });

  const mapped = mapRecentlyPlayedFromApi(data);

  return mapped.items.map((item) => ({
    albumId: item.track.album.id,
    artistIds: item.track.artists.map((artist) => artist.id),
    playedAt: new Date(item.playedAt),
    trackId: item.track.id,
  }));
}

async function getLatestPlayedAt(): Promise<Date | null> {
  const latest = await db.SpotifyPlay.findOne({
    attributes: ['playedAt'],
    order: [['playedAt', 'DESC']],
  });
  return latest?.playedAt ?? null;
}

/**
 * Persists listening history from Spotify's recently-played endpoint.
 * An empty DB seeds from the current recent-plays window (no `after` filter).
 * This is separate from the "latest song" UI fetch.
 */
export async function syncSpotifyPlaysSince(): Promise<{
  inserted: number;
  total: number;
  gapDetected: boolean;
}> {
  const latestPlayedAt = await getLatestPlayedAt();

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

  // Count before insert to get accurate inserted count
  // (bulkCreate with ignoreDuplicates doesn't reliably set isNewRecord)
  const countBefore = await db.SpotifyPlay.count();

  await db.SpotifyPlay.bulkCreate(plays, {
    ignoreDuplicates: true,
  });

  const countAfter = await db.SpotifyPlay.count();
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
};

const getContextLabel = (context: SyncContext) => (context === 'cron' ? 'Cron' : 'Backfill');

/**
 * Runs a history sync with consistent, centralized error handling.
 */
export async function syncSpotifyHistoryWithLogging({
  context,
  failureLogLevel = 'error',
}: SyncWithLoggingOptions) {
  try {
    const result = await syncSpotifyPlaysSince();
    log.info(`${getContextLabel(context)}: Spotify history sync complete`, result);
    return result;
  } catch (error) {
    log[failureLogLevel](`${getContextLabel(context)}: Spotify history sync failed`, {
      error: serializeError(error as Error),
    });
    return null;
  }
}
