import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { rankAlbums, rankArtists, rankTracks } from '../rankMusic';

let playCounter = 0;

function play(track: string, album: string, artists: string): HistoryTrack {
  playCounter += 1;
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: artists,
    playedAt: `2026-08-04T12:${String(playCounter).padStart(2, '0')}:00.000Z`,
    trackId: `track-${track}`,
    trackName: track,
    url: `https://open.spotify.com/track/${track}`,
  };
}

const favorite = (id: string, name: string): PlaylistAlbum => ({
  addedAt: '2026-01-01T00:00:00Z',
  artistNames: `${name} artist`,
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  name,
  primaryArtist: `${name} artist`,
  releaseDate: '2024-01-01',
  url: `https://open.spotify.com/album/${id}`,
});

describe('rankMusic', () => {
  it('orders tracks by play count and keeps the cover from the first play', () => {
    const ranked = rankTracks([
      play('One', 'Bloom', 'Alder'),
      play('Two', 'Clay', 'Moss'),
      play('One', 'Bloom', 'Alder'),
    ]);

    expect(ranked.map((track) => [track.title, track.playCount, track.imageUrl])).toEqual([
      ['One', 2, 'https://i.scdn.co/image/Bloom'],
      ['Two', 1, 'https://i.scdn.co/image/Clay'],
    ]);
  });

  it('splits collab credits so each artist counts', () => {
    const ranked = rankArtists([play('One', 'Bloom', 'Alder, Moss'), play('Two', 'Clay', 'Alder')]);

    expect(ranked.map((artist) => [artist.name, artist.playCount])).toEqual([
      ['Alder', 2],
      ['Moss', 1],
    ]);
  });

  it('fills on-repeat albums from favorites when history is thin', () => {
    const ranked = rankAlbums(
      [play('One', 'Bloom', 'Alder')],
      [favorite('currents', 'Currents'), favorite('usb', 'USB')],
    );

    expect(ranked.map((album) => album.name)).toEqual(['Bloom', 'Currents', 'USB']);
    expect(ranked[0]?.playCount).toBe(1);
    expect(ranked[1]?.playCount).toBe(0);
  });
});
