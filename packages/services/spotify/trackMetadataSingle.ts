import 'server-only';

import * as v from 'valibot';
import { bestSpotifyImage, spotifyGet } from './trackMetadataShared';

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

const searchTracksResponseSchema = v.looseObject({
  tracks: v.looseObject({
    items: v.array(trackDisplaySchema),
  }),
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

function toTrackDisplayData(track: v.InferOutput<typeof trackDisplaySchema>): TrackDisplayData {
  return {
    album: {
      id: track.album.id,
      imageUrl: bestSpotifyImage(track.album.images),
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

/**
 * Fetches full display-ready track data from Spotify API.
 * Returns structured data ready for Music* table inserts.
 */
export async function fetchTrackDisplayData(trackId: string): Promise<TrackDisplayData | null> {
  const result = await spotifyGet(`tracks/${trackId}`, trackDisplaySchema, 'track display');
  return result.success ? toTrackDisplayData(result.data) : null;
}

/**
 * Resolves a track by title and artist name via Spotify Search API.
 */
export async function searchTrackDisplayData(
  trackName: string,
  artistName: string,
): Promise<TrackDisplayData | null> {
  const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
  const result = await spotifyGet(
    `search?type=track&limit=5&q=${query}`,
    searchTracksResponseSchema,
    'track search',
  );
  if (!result.success) {
    return null;
  }
  const items = result.data.tracks.items;
  const lowerTrack = trackName.trim().toLowerCase();
  const lowerArtist = artistName.trim().toLowerCase();
  const matched =
    items.find(
      (item) =>
        item.name.trim().toLowerCase() === lowerTrack &&
        item.artists.some((a) => a.name.trim().toLowerCase() === lowerArtist),
    ) ?? items[0];
  return matched ? toTrackDisplayData(matched) : null;
}
