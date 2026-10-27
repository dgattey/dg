import * as v from 'valibot';

/**
 * API response fields for artists, albums, and tracks (snake_case).
 */
const referenceApiFields = {
  external_urls: v.looseObject({
    /**
     * URL accessible by non-API users.
     */
    spotify: v.string(),
  }),
  /**
   * API URL, not public url.
   */
  href: v.string(),
  /**
   * Unique id.
   */
  id: v.string(),
  /**
   * Name of the resource, like "Glass Animals".
   */
  name: v.string(),
  /**
   * Resource identifier, more readable than the id.
   */
  uri: v.string(),
};

/**
 * Schema for artist/album/track reference objects (API shape).
 */
const referenceApiSchema = v.looseObject(referenceApiFields);

/**
 * Album art image metadata from the Spotify API.
 */
const albumImageApiSchema = v.looseObject({
  height: v.number(),
  url: v.string(),
  width: v.number(),
});

/**
 * Album schema, including images and release date (API shape).
 */
const albumApiSchema = v.looseObject({
  ...referenceApiFields,
  images: v.array(albumImageApiSchema),
  release_date: v.string(),
});

/**
 * Track schema used by currently playing and recently played endpoints (API shape).
 */
export const trackApiSchema = v.looseObject({
  ...referenceApiFields,
  album: albumApiSchema,
  /**
   * All artists on the track
   */
  artists: v.array(referenceApiSchema),
  /**
   * Track duration, in milliseconds.
   */
  duration_ms: v.optional(v.number()),
  /**
   * Cross-service identifiers, like the ISRC used to look up tempo elsewhere.
   */
  external_ids: v.optional(v.looseObject({ isrc: v.optional(v.string()) })),
  /**
   * Whether the track is currently playing.
   */
  is_playing: v.optional(v.boolean()),
  /**
   * May be present, if the right resource is used.
   */
  played_at: v.optional(v.string()),
  /**
   * Current playback position, in milliseconds.
   */
  progress_ms: v.optional(v.number()),
});

type ArtistApi = v.InferOutput<typeof referenceApiSchema>;
type AlbumApi = v.InferOutput<typeof albumApiSchema>;
type TrackApi = v.InferOutput<typeof trackApiSchema>;

/**
 * Domain artist type (camelCase), aligned with `SpotifyLink`.
 */
export type Artist = {
  id: string;
  name: string;
  url: string;
};

/**
 * Domain album type (camelCase).
 */
export type Album = Artist & {
  releaseDate: string;
};

type AlbumImage = {
  height: number;
  width: number;
  url: string;
};

/**
 * Domain track type (camelCase).
 */
export type Track = Artist & {
  artists: Array<Artist>;
  album: Album;
  albumImage: AlbumImage;
  /**
   * Tempo in beats per minute, attached server-side when a lookup knows it.
   */
  bpm?: number;
  durationMs?: number;
  isrc?: string;
  playedAt?: string;
  progressMs?: number;
  isPlaying?: boolean;
};

const mapArtistFromApi = (artist: ArtistApi): Artist => ({
  id: artist.id,
  name: artist.name,
  url: artist.external_urls.spotify,
});

const mapAlbumFromApi = (album: AlbumApi): Album => ({
  ...mapArtistFromApi(album),
  releaseDate: album.release_date,
});

const getAlbumImage = (album: AlbumApi): AlbumImage | null => {
  const preferred = album.images.find((image) => image.width === 640) ?? album.images[0];
  return preferred ?? null;
};

/**
 * Converts a Spotify API track payload into a camelCase domain object.
 */
export const mapTrackFromApi = (track: TrackApi): Track | null => {
  const albumImage = getAlbumImage(track.album);
  if (!albumImage) {
    return null;
  }
  return {
    ...mapArtistFromApi(track),
    album: mapAlbumFromApi(track.album),
    albumImage,
    artists: track.artists.map(mapArtistFromApi),
    durationMs: track.duration_ms,
    isPlaying: track.is_playing,
    isrc: track.external_ids?.isrc,
    playedAt: track.played_at,
    progressMs: track.progress_ms,
  };
};
