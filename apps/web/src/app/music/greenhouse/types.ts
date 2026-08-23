import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { Track } from '@dg/content-models/spotify/Track';
import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';

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
  historyCursor?: string | null;
  historyTracks?: ReadonlyArray<HistoryTrack>;
  nowPlaying?: Track;
  tracks?: ReadonlyArray<RankedTrack>;
};
