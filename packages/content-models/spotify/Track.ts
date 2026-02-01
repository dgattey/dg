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
   * Optional CSS gradient derived from album art for UI use.
   */
  albumGradient: v.optional(v.string()),
  /**
   * Derived contrast hint for album gradient background.
   */
  albumGradientIsDark: v.optional(v.boolean()),
  artists: v.array(referenceApiSchema),
  /**
   * Track duration, in milliseconds.
   */
  duration_ms: v.optional(v.number()),
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
  /**
   * Server-derived relative timestamp for last played tracks.
   */
  relativePlayedAt: v.optional(v.nullable(v.string())),
});

export type ArtistApi = v.InferOutput<typeof referenceApiSchema>;
export type AlbumApi = v.InferOutput<typeof albumApiSchema>;
export type TrackApi = v.InferOutput<typeof trackApiSchema>;

type ExternalUrls = {
  spotify: string;
};

/**
 * Domain artist type (camelCase).
 */
export type Artist = {
  externalUrls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  uri: string;
};

/**
 * Domain album type (camelCase).
 */
export type Album = Artist & {
  images: Array<{
    height: number;
    width: number;
    url: string;
  }>;
  releaseDate: string;
};

export type AlbumImage = {
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
  durationMs?: number;
  playedAt?: string;
  relativePlayedAt?: string | null;
  progressMs?: number;
  isPlaying?: boolean;
  albumGradient?: string;
  albumGradientIsDark?: boolean;
};

const mapArtistFromApi = (artist: ArtistApi): Artist => ({
  externalUrls: artist.external_urls,
  href: artist.href,
  id: artist.id,
  name: artist.name,
  uri: artist.uri,
});

const mapAlbumFromApi = (album: AlbumApi): Album => ({
  ...mapArtistFromApi(album),
  images: album.images,
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
    albumGradient: track.albumGradient,
    albumGradientIsDark: track.albumGradientIsDark,
    albumImage,
    artists: track.artists.map(mapArtistFromApi),
    durationMs: track.duration_ms,
    isPlaying: track.is_playing,
    playedAt: track.played_at,
    progressMs: track.progress_ms,
    relativePlayedAt: track.relativePlayedAt,
  };
};
