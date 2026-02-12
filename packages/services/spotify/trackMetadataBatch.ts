import 'server-only';

import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import * as v from 'valibot';
import {
  extractMetadataFromTrack,
  extractTrackId,
  sleep,
  spotifyGetWithRetry,
  type TrackMetadata,
  trackSchema,
} from './trackMetadataShared';

const BATCH_SIZE = 50;
const THROTTLE_MS = 200;

/**
 * Schema for the batch tracks response from GET /tracks?ids=
 *
 * NOTE: This endpoint is being deprecated by Spotify (removal ~March 2026).
 * Use this module only for historical imports. For ongoing sync, use
 * trackMetadataSingle.ts instead.
 */
const batchTracksResponseSchema = v.looseObject({
  tracks: v.array(v.nullable(trackSchema)),
});

/**
 * Fetches track metadata for a single batch of IDs (max 50) with 429 retry.
 *
 * @deprecated Batch endpoint being removed by Spotify. Use for imports only.
 */
async function fetchSingleBatch(trackIds: Array<string>): Promise<Map<string, TrackMetadata>> {
  const result = new Map<string, TrackMetadata>();
  if (trackIds.length === 0) {
    return result;
  }

  const resource = `tracks?ids=${trackIds.join(',')}`;
  const requestedIdSet = new Set(trackIds);
  const response = await spotifyGetWithRetry(resource, batchTracksResponseSchema, 'batch');

  if (!response.success) {
    return result;
  }

  for (const track of response.data.tracks) {
    if (!track) {
      continue;
    }
    const metadata = extractMetadataFromTrack(track);

    // Spotify may re-link tracks to a new ID. The uri still contains the
    // original requested ID (e.g. "spotify:track:ORIGINAL"), so prefer it.
    const uriId = track.uri ? extractTrackId(track.uri) : null;
    if (uriId && requestedIdSet.has(uriId)) {
      result.set(uriId, metadata);
    } else if (requestedIdSet.has(track.id)) {
      result.set(track.id, metadata);
    }
  }

  return result;
}

type BatchFetchResult = {
  metadata: Map<string, TrackMetadata>;
  batchErrors: Array<{ error: unknown; trackIds: Array<string> }>;
};

/**
 * Fetches track metadata for any number of IDs, chunking into batches of 50
 * with throttling between requests. Returns all fetched metadata plus any
 * batch-level errors for logging.
 *
 * @deprecated Batch endpoint being removed by Spotify. Use for imports only.
 */
export async function fetchAllTrackMetadataBatch(
  trackIds: Array<string>,
): Promise<BatchFetchResult> {
  const metadata = new Map<string, TrackMetadata>();
  const batchErrors: BatchFetchResult['batchErrors'] = [];

  for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
    const batch = trackIds.slice(i, i + BATCH_SIZE);

    try {
      const batchResult = await fetchSingleBatch(batch);
      for (const [trackId, meta] of batchResult) {
        metadata.set(trackId, meta);
      }
      const missingFromBatch = batch.filter((id) => !batchResult.has(id));
      if (missingFromBatch.length > 0) {
        batchErrors.push({ error: 'Missing from API response', trackIds: missingFromBatch });
      }
    } catch (error) {
      batchErrors.push({
        error: serializeError(error as Error),
        trackIds: batch,
      });
    }

    if (i + BATCH_SIZE < trackIds.length) {
      await sleep(THROTTLE_MS);
    }
  }

  return { batchErrors, metadata };
}
