import 'server-only';

import * as v from 'valibot';
import { spotifyGetWithRetry } from './trackMetadataShared';

/**
 * Extended track schema for fetching display-ready data.
 * Includes album images and external URLs for UI rendering.
 */
const trackDisplaySchema = v.looseObject({
  album: v.looseObject({
    external_urls: v.looseObject({ spotify: v.string() }),
    id: v.string(),
    images: v.array(
      v.looseObject({
        height: v.number(),
        url: v.string(),
        width: v.number(),
      }),
    ),
    name: v.string(),
  }),
  artists: v.array(
    v.looseObject({
      external_urls: v.looseObject({ spotify: v.string() }),
      id: v.string(),
      name: v.string(),
    }),
  ),
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  name: v.string(),
});

/**
 * Display-ready track data structured for Music* table inserts.
 */
export type TrackDisplayData = {
  track: {
    id: string;
    name: string;
    albumId: string;
    url: string;
  };
  album: {
    id: string;
    name: string;
    imageUrl: string;
    url: string;
  };
  artists: Array<{
    id: string;
    name: string;
    url: string;
    position: number;
  }>;
};

/**
 * Selects the best album image (prefers 640px width, falls back to first).
 */
function bestImage(images: Array<{ height: number; url: string; width: number }>): string {
  const preferred = images.find((img) => img.width === 640) ?? images[0];
  return preferred?.url ?? '';
}

/**
 * Fetches full display-ready track data from Spotify API.
 * Returns structured data ready for Music* table inserts.
 */
export async function fetchTrackDisplayData(trackId: string): Promise<TrackDisplayData | null> {
  const result = await spotifyGetWithRetry(
    `tracks/${trackId}`,
    trackDisplaySchema,
    'track display',
  );
  if (!result.success) {
    return null;
  }
  const track = result.data;
  return {
    album: {
      id: track.album.id,
      imageUrl: bestImage(track.album.images),
      name: track.album.name,
      url: track.album.external_urls.spotify,
    },
    artists: track.artists.map((a, i) => ({
      id: a.id,
      name: a.name,
      position: i,
      url: a.external_urls.spotify,
    })),
    track: {
      albumId: track.album.id,
      id: track.id,
      name: track.name,
      url: track.external_urls.spotify,
    },
  };
}
