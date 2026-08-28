import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { groupAdjacentAlbumPlays } from '../groupAdjacentAlbumPlays';

type PlayOptions = {
  album: string;
  track: string;
  playedAt?: string;
  albumUrl?: string;
};

let playCounter = 0;

function play({ album, track, playedAt, albumUrl }: PlayOptions): HistoryTrack {
  playCounter += 1;
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: albumUrl ?? `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    playedAt: playedAt ?? `2026-08-04T12:${String(playCounter).padStart(2, '0')}:00.000Z`,
    trackId: `track-${track}`,
    trackName: track,
    url: `https://open.spotify.com/track/${track}`,
  };
}

const runShape = (tracks: Array<HistoryTrack>) =>
  groupAdjacentAlbumPlays(tracks).map((run) => [run.albumName, run.tracks.length]);

describe('groupAdjacentAlbumPlays', () => {
  it('returns nothing for an empty list', () => {
    expect(groupAdjacentAlbumPlays([])).toEqual([]);
  });

  it('keeps standalone plays as runs of one', () => {
    const tracks = [
      play({ album: 'Bloom', track: 'One' }),
      play({ album: 'Clay', track: 'Two' }),
      play({ album: 'Dusk', track: 'Three' }),
    ];

    expect(runShape(tracks)).toEqual([
      ['Bloom', 1],
      ['Clay', 1],
      ['Dusk', 1],
    ]);
  });

  it('collapses a straight album listen into one run', () => {
    const tracks = [
      play({ album: 'Bloom', track: 'One' }),
      play({ album: 'Bloom', track: 'Two' }),
      play({ album: 'Bloom', track: 'Three' }),
      play({ album: 'Clay', track: 'Four' }),
    ];

    expect(runShape(tracks)).toEqual([
      ['Bloom', 3],
      ['Clay', 1],
    ]);
  });

  it('only merges plays that sit next to each other', () => {
    const tracks = [
      play({ album: 'Bloom', track: 'One' }),
      play({ album: 'Bloom', track: 'Two' }),
      play({ album: 'Clay', track: 'Three' }),
      play({ album: 'Bloom', track: 'Four' }),
      play({ album: 'Bloom', track: 'Five' }),
    ];

    expect(runShape(tracks)).toEqual([
      ['Bloom', 2],
      ['Clay', 1],
      ['Bloom', 2],
    ]);
  });

  it('merges a run that straddles an infinite scroll page boundary', () => {
    const firstPage = [
      play({ album: 'Bloom', track: 'One' }),
      play({ album: 'Bloom', track: 'Two' }),
    ];
    const secondPage = [
      play({ album: 'Bloom', track: 'Three' }),
      play({ album: 'Clay', track: 'Four' }),
    ];

    expect(runShape([...firstPage, ...secondPage])).toEqual([
      ['Bloom', 3],
      ['Clay', 1],
    ]);
  });

  it('keeps the opening play as the run key so appended pages reuse the cell', () => {
    const firstPage = [play({ album: 'Bloom', track: 'One' })];
    const secondPage = [play({ album: 'Bloom', track: 'Two' })];

    const [beforeRun] = groupAdjacentAlbumPlays(firstPage);
    const [afterRun] = groupAdjacentAlbumPlays([...firstPage, ...secondPage]);

    expect(afterRun?.key).toBe(beforeRun?.key);
  });

  it('points a run at the album rather than any single track', () => {
    const [run] = groupAdjacentAlbumPlays([
      play({ album: 'Bloom', track: 'One' }),
      play({ album: 'Bloom', track: 'Two' }),
    ]);

    expect(run?.linkUrl).toBe('https://open.spotify.com/album/Bloom');
  });

  it('falls back to the opening track when the album has no page', () => {
    const [run] = groupAdjacentAlbumPlays([
      play({ album: 'Bloom', albumUrl: '', track: 'One' }),
      play({ album: 'Bloom', albumUrl: '', track: 'Two' }),
    ]);

    expect(run?.linkUrl).toBe('https://open.spotify.com/track/One');
  });

  it('separates same-named albums that have different IDs', () => {
    const live = { ...play({ album: 'Bloom', track: 'One' }), albumId: 'album-Bloom-live' };
    const studio = play({ album: 'Bloom', track: 'Two' });

    expect(runShape([live, studio])).toEqual([
      ['Bloom', 1],
      ['Bloom', 1],
    ]);
  });

  it('groups legacy rows without an album ID by name and art', () => {
    const withoutIds = [
      { ...play({ album: 'Bloom', track: 'One' }), albumId: '' },
      { ...play({ album: 'Bloom', track: 'Two' }), albumId: '' },
      { ...play({ album: 'Clay', track: 'Three' }), albumId: '' },
    ];

    expect(runShape(withoutIds)).toEqual([
      ['Bloom', 2],
      ['Clay', 1],
    ]);
  });
});
