import 'server-only';

import { mapTrackFromApi, type Track, trackApiSchema } from '@dg/content-models/spotify/Track';
import * as v from 'valibot';
import { parseResponse } from '../clients/parseResponse';
import { spotifyClient } from './spotifyClient';

const tracksResponseSchema = v.looseObject({
  tracks: v.array(v.nullable(trackApiSchema)),
});

/**
 * Hydrates stored Spotify track IDs into full Track objects.
 * Uses GET /tracks?ids= (max 50 IDs per request).
 */
export async function fetchSpotifyTracksByIds(
  trackIds: Array<string>,
): Promise<Array<Track | null>> {
  if (trackIds.length === 0) {
    return [];
  }
  if (trackIds.length > 50) {
    throw new Error('fetchSpotifyTracksByIds: max 50 IDs per request');
  }

  const resource = `tracks?ids=${trackIds.join(',')}`;
  const { response, status } = await spotifyClient.get(resource);

  if (status !== 200) {
    return trackIds.map(() => null);
  }

  const data = parseResponse(tracksResponseSchema, await response.json(), {
    kind: 'rest',
    source: 'spotify.fetchSpotifyTracksByIds',
  });

  return data.tracks.map((track) => (track ? mapTrackFromApi(track) : null));
}

/**
 * Fetches track details in 50-ID batches while preserving input ordering.
 */
export async function fetchSpotifyTracksByIdsBatched(
  trackIds: Array<string>,
): Promise<Array<Track | null>> {
  const results: Array<Track | null> = [];

  for (let i = 0; i < trackIds.length; i += 50) {
    const batch = trackIds.slice(i, i + 50);
    const batchResults = await fetchSpotifyTracksByIds(batch);
    results.push(...batchResults);
  }

  return results;
}
