import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { Track } from '@dg/content-models/spotify/Track';

export type RankedTrack = {
  artist: string;
  id: string;
  imageUrl: string;
  playCount: number;
  title: string;
  url: string;
};

export type RankedArtist = {
  id: string;
  imageUrl: string;
  name: string;
  playCount: number;
  url: string;
};

export type RankedAlbum = {
  artistNames: string;
  id: string;
  imageUrl: string;
  name: string;
  playCount: number;
  url: string;
};

export type MusicGreenhouseFixture = {
  albums?: ReadonlyArray<RankedAlbum>;
  artists?: ReadonlyArray<RankedArtist>;
  favoriteAlbums?: ReadonlyArray<PlaylistAlbum>;
  nowPlaying?: Track;
  tracks?: ReadonlyArray<RankedTrack>;
};
