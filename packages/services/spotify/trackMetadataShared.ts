import 'server-only';

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
 * Selects the best album image (prefers 640px width, falls back to first).
 */
export function bestSpotifyImage(
  images: ReadonlyArray<{ height: number; url: string; width: number }>,
): string {
  const preferred = images.find((img) => img.width === 640) ?? images[0];
  return preferred?.url ?? '';
}

/**
 * Promise-based sleep utility for throttling API requests.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Result of a Spotify API request.
 */
type SpotifyRequestResult<T> =
  | { success: true; data: T; status: 200 }
  | { success: false; status: number; error: string };

/**
 * Makes a GET request to Spotify and validates the payload.
 *
 * Deliberately does not retry. Every caller is on a page render, and sleeping
 * through a rate limit while a visitor waits is never the right trade — an
 * earlier backoff ladder here made `/music/albums` hang for 51 seconds before
 * showing an empty page. Rate limits are absorbed by caching the successful
 * result and by falling back to stored data, not by waiting.
 */
export async function spotifyGet<T>(
  resource: string,
  schema: v.GenericSchema<unknown, T>,
  context: string,
): Promise<SpotifyRequestResult<T>> {
  const { response, retryAfterSeconds, status } = await getSpotifyClient().get(resource);

  if (status !== 200) {
    if (status === 429) {
      log.warn(`Spotify rate limited (${context})`, { resource, retryAfterSeconds });
    }
    return { error: `HTTP ${status}`, status, success: false };
  }

  const data = v.parse(schema, await response.json());
  return { data, status: 200, success: true };
}
