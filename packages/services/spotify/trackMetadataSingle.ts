import 'server-only';

import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import {
  extractMetadataFromTrack,
  sleep,
  spotifyGetWithRetry,
  type TrackMetadata,
  trackSchema,
} from './trackMetadataShared';

const THROTTLE_MS = 100;

/**
 * Result of fetching a single track's metadata.
 */
export type SingleTrackResult =
  | { success: true; metadata: TrackMetadata }
  | { success: false; error: string };

/**
 * Fetches metadata for a single track by ID using GET /tracks/{id}.
 * Includes retry logic for rate limiting (429 responses).
 */
export async function fetchSingleTrackMetadata(trackId: string): Promise<SingleTrackResult> {
  const result = await spotifyGetWithRetry(`tracks/${trackId}`, trackSchema, 'single track');

  if (!result.success) {
    const error = result.status === 404 ? 'Track not found' : result.error;
    return { error, success: false };
  }

  return {
    metadata: extractMetadataFromTrack(result.data),
    success: true,
  };
}

/**
 * Result of fetching multiple tracks individually.
 */
export type MultipleSingleFetchResult = {
  metadata: Map<string, TrackMetadata>;
  errors: Array<{ trackId: string; error: string }>;
};

/**
 * Fetches track metadata for multiple IDs using individual GET /tracks/{id} calls.
 * This is slower than batch fetching but doesn't require the deprecated batch endpoint.
 *
 * Includes throttling between requests to avoid rate limiting.
 */
export async function fetchMultipleTrackMetadata(
  trackIds: Array<string>,
): Promise<MultipleSingleFetchResult> {
  const metadata = new Map<string, TrackMetadata>();
  const errors: MultipleSingleFetchResult['errors'] = [];

  for (let i = 0; i < trackIds.length; i++) {
    const trackId = trackIds[i];
    if (!trackId) {
      continue;
    }

    try {
      const result = await fetchSingleTrackMetadata(trackId);
      if (result.success) {
        metadata.set(trackId, result.metadata);
      } else {
        errors.push({ error: result.error, trackId });
      }
    } catch (error) {
      errors.push({
        error: serializeError(error as Error).message ?? 'Unknown error',
        trackId,
      });
    }

    // Throttle between requests to avoid rate limiting
    if (i < trackIds.length - 1) {
      await sleep(THROTTLE_MS);
    }
  }

  return { errors, metadata };
}
