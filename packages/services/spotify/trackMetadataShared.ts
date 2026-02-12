import 'server-only';

import { db, Op } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import * as v from 'valibot';
import { getSpotifyClient } from './spotifyClient';

/**
 * Metadata needed to create a SpotifyPlay row.
 */
export type TrackMetadata = {
  albumId: string;
  artistIds: Array<string>;
};

/**
 * Shared schema for track data from Spotify API responses.
 * Used by both batch and single track endpoints.
 */
export const trackSchema = v.looseObject({
  album: v.looseObject({ id: v.string() }),
  artists: v.array(v.looseObject({ id: v.string() })),
  id: v.string(),
  uri: v.optional(v.string()),
});

export type SpotifyTrack = v.InferOutput<typeof trackSchema>;

/**
 * Extracts TrackMetadata from a Spotify track response.
 */
export function extractMetadataFromTrack(track: SpotifyTrack): TrackMetadata {
  return {
    albumId: track.album.id,
    artistIds: track.artists.map((artist) => artist.id),
  };
}

/**
 * Extracts a track ID from a Spotify URI (e.g. "spotify:track:abc123" -> "abc123").
 */
export function extractTrackId(uri: string): string {
  return uri.split(':')[2] ?? '';
}

/**
 * Looks up track metadata from existing SpotifyPlay rows in the database.
 * This allows us to skip API calls for tracks we've already seen.
 */
export async function getExistingTrackMetadata(
  trackIds: Array<string>,
): Promise<Map<string, TrackMetadata>> {
  if (trackIds.length === 0) {
    return new Map();
  }

  const existingRows = await db.SpotifyPlay.findAll({
    attributes: ['trackId', 'albumId', 'artistIds'],
    group: ['trackId', 'albumId', 'artistIds'],
    where: { trackId: { [Op.in]: trackIds } },
  });

  return new Map(
    existingRows.map((row) => [row.trackId, { albumId: row.albumId, artistIds: row.artistIds }]),
  );
}

/**
 * Promise-based sleep utility for throttling API requests.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry configuration for Spotify API calls.
 */
export const RETRY_CONFIG = {
  /** Initial wait time in seconds for rate limit backoff */
  initialBackoffSeconds: 5,
  /** Maximum wait time in seconds for rate limit backoff */
  maxBackoffSeconds: 30,
  /** Maximum number of retries for rate-limited requests */
  maxRetries: 3,
} as const;

/**
 * Result of a Spotify API request with rate limit retry.
 */
export type SpotifyRequestResult<T> =
  | { success: true; data: T; status: 200 }
  | { success: false; status: number; error: string };

/**
 * Makes a GET request to Spotify with automatic rate limit retry.
 * Handles 429 responses with exponential backoff.
 */
export async function spotifyGetWithRetry<T>(
  resource: string,
  schema: v.GenericSchema<unknown, T>,
  context: string,
): Promise<SpotifyRequestResult<T>> {
  let retries = 0;

  while (retries <= RETRY_CONFIG.maxRetries) {
    const { response, status } = await getSpotifyClient().get(resource);

    if (status === 429) {
      const waitSeconds = Math.min(
        RETRY_CONFIG.initialBackoffSeconds * (retries + 1),
        RETRY_CONFIG.maxBackoffSeconds,
      );
      log.warn(`Spotify rate limited (${context}), waiting`, { resource, retries, waitSeconds });
      await sleep(waitSeconds * 1000);
      retries++;
      continue;
    }

    if (status !== 200) {
      return { error: `HTTP ${status}`, status, success: false };
    }

    const data = v.parse(schema, await response.json());
    return { data, status: 200, success: true };
  }

  log.warn(`Spotify request failed after max retries (${context})`, { resource });
  return { error: 'Max retries exceeded', status: 429, success: false };
}
