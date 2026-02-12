import 'server-only';

import { db, Op } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import * as v from 'valibot';
import { getSpotifyClient } from './spotifyClient';

export type TrackMetadata = {
  albumId: string;
  artistIds: Array<string>;
};

/**
 * Extracts a track ID from a Spotify URI (e.g. "spotify:track:abc123" -> "abc123").
 */
export function extractTrackId(uri: string): string {
  return uri.split(':')[2] ?? '';
}

/**
 * Looks up track metadata from existing SpotifyPlay rows in the database.
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

const BATCH_SIZE = 50;
const THROTTLE_MS = 200;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Schema for the batch tracks response from GET /tracks?ids=
 */
const batchTracksResponseSchema = v.looseObject({
  tracks: v.array(
    v.nullable(
      v.looseObject({
        album: v.looseObject({ id: v.string() }),
        artists: v.array(v.looseObject({ id: v.string() })),
        id: v.string(),
        uri: v.string(),
      }),
    ),
  ),
});

/**
 * Fetches track metadata for a single batch of IDs (max 50) with 429 retry.
 */
async function fetchSingleBatch(trackIds: Array<string>): Promise<Map<string, TrackMetadata>> {
  const result = new Map<string, TrackMetadata>();
  if (trackIds.length === 0) {
    return result;
  }

  const resource = `tracks?ids=${trackIds.join(',')}`;
  const requestedIdSet = new Set(trackIds);
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    const { response, status } = await getSpotifyClient().get(resource);

    if (status === 429) {
      const waitSeconds = Math.min(5 * (retries + 1), 30);
      log.warn('Spotify rate limited, waiting', { retries, waitSeconds });
      await sleep(waitSeconds * 1000);
      retries++;
      continue;
    }

    if (status !== 200) {
      log.warn('Spotify batch fetch failed', { status, trackIds: trackIds.slice(0, 3) });
      return result;
    }

    const data = v.parse(batchTracksResponseSchema, await response.json());

    for (const track of data.tracks) {
      if (!track) {
        continue;
      }
      const metadata = {
        albumId: track.album.id,
        artistIds: track.artists.map((artist) => artist.id),
      };

      // Spotify may re-link tracks to a new ID. The uri still contains the
      // original requested ID (e.g. "spotify:track:ORIGINAL"), so prefer it.
      const uriId = extractTrackId(track.uri);
      if (requestedIdSet.has(uriId)) {
        result.set(uriId, metadata);
      } else if (requestedIdSet.has(track.id)) {
        result.set(track.id, metadata);
      }
    }

    return result;
  }

  log.warn('Spotify batch fetch failed after max retries', { trackIds: trackIds.slice(0, 3) });
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
 */
export async function fetchAllTrackMetadata(trackIds: Array<string>): Promise<BatchFetchResult> {
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
