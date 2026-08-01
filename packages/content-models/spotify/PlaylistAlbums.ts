import * as v from 'valibot';
import { mapTrackFromApi, trackApiSchema } from './Track';

/**
 * One page of Spotify's playlist items endpoint. Items stay unknown here so a
 * single odd entry (local file, episode, removed track) can be skipped at
 * mapping time instead of failing the whole page.
 */
export const playlistItemsPageApiSchema = v.looseObject({
  items: v.array(v.unknown()),
  /**
   * Link to the next page, null on the last page.
   */
  next: v.optional(v.nullable(v.string())),
});

/**
 * A single playlist entry: when it was added plus the full track payload.
 * Track is null for entries Spotify can no longer resolve.
 */
const playlistItemApiSchema = v.looseObject({
  /**
   * Parseable date time string like 2022-01-28T10:06:57.412Z.
   */
  added_at: v.string(),
  track: v.nullable(trackApiSchema),
});

/**
 * An album pulled out of a playlist, flattened to exactly what album-grid UI
 * needs plus the keys the UI sorts by.
 */
export type PlaylistAlbum = {
  /** Spotify album id */
  id: string;
  /** Album name */
  name: string;
  /** All artist names joined, like "Artist A, Artist B" */
  artistNames: string;
  /** First artist name, used for artist sorting */
  primaryArtist: string;
  /** Album art URL (preferred size) */
  imageUrl: string;
  /** Public open.spotify.com album URL */
  url: string;
  /** ISO timestamp the album first entered the playlist */
  addedAt: string;
  /** Album release date: YYYY, YYYY-MM, or YYYY-MM-DD */
  releaseDate: string;
};

/**
 * Collapses raw playlist items into unique albums, newest playlist addition
 * first. Items that fail to parse are skipped. Re-adding another track from
 * an album keeps the album's earliest add date so it doesn't reshuffle.
 */
export const mapPlaylistAlbumsFromApi = (items: Array<unknown>): Array<PlaylistAlbum> => {
  const albums = new Map<string, PlaylistAlbum>();
  for (const rawItem of items) {
    const parsed = v.safeParse(playlistItemApiSchema, rawItem);
    if (!parsed.success || !parsed.output.track) {
      continue;
    }
    const track = mapTrackFromApi(parsed.output.track);
    if (!track) {
      continue;
    }
    const addedAt = parsed.output.added_at;
    const existing = albums.get(track.album.id);
    if (existing) {
      if (addedAt < existing.addedAt) {
        existing.addedAt = addedAt;
      }
      continue;
    }
    albums.set(track.album.id, {
      addedAt,
      artistNames: track.artists.map((artist) => artist.name).join(', '),
      id: track.album.id,
      imageUrl: track.albumImage.url,
      name: track.album.name,
      primaryArtist: track.artists[0]?.name ?? '',
      releaseDate: track.album.releaseDate,
      url: track.album.externalUrls.spotify,
    });
  }
  return [...albums.values()].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
};
