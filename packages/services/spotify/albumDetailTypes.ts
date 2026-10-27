import type { SpotifyLink } from './spotifyLinks';

/**
 * Display-ready album detail shared by the Spotify service and album well UI.
 * Kept free of `server-only` so client components can import the type.
 */

export type AlbumDetailArtist = SpotifyLink;

export type AlbumDetailTrack = {
  id: string;
  name: string;
  url: string;
  durationMs: number | null;
  trackNumber: number;
  discNumber: number;
  artists: Array<AlbumDetailArtist>;
};

export type AlbumDetail = {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  releaseDate: string | null;
  label: string | null;
  totalTracks: number;
  durationMs: number;
  artists: Array<AlbumDetailArtist>;
  tracks: Array<AlbumDetailTrack>;
};
