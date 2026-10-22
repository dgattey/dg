import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { groupTracksByDate } from '../groupTracksByDate';

const NOW = new Date(2026, 9, 22, 12).getTime();

function play(album: string, daysAgo: number, minute = 0): HistoryTrack {
  const playedAt = new Date(NOW - daysAgo * 86_400_000 - minute * 60_000);
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    playedAt: playedAt.toISOString(),
    trackId: `track-${album}-${daysAgo}-${minute}`,
    trackName: `${album} ${minute}`,
    url: `https://open.spotify.com/track/${album}`,
  };
}

const shape = (tracks: Array<HistoryTrack>) =>
  groupTracksByDate(tracks, NOW).map((section) => [section.label, section.tracks.length]);

describe('groupTracksByDate', () => {
  it('keeps a recent section once it has three album cards', () => {
    expect(shape([play('A', 0), play('B', 0, 1), play('C', 0, 2), play('D', 1)])).toEqual([
      ['Today', 3],
      ['This week', 1],
    ]);
  });

  it('folds a sparse today into this week', () => {
    expect(shape([play('A', 0), play('B', 1), play('C', 1, 1), play('D', 1, 2)])).toEqual([
      ['This week', 4],
    ]);
  });

  it('counts album cards, not plays, so a whole album today is still one card', () => {
    const album = [0, 1, 2, 3, 4].map((minute) => play('A', 0, minute));

    expect(shape([...album, play('B', 1)])).toEqual([['This week', 6]]);
  });

  it('keeps folding through this week into this month', () => {
    expect(shape([play('A', 0), play('B', 1), play('C', 10), play('D', 10, 1)])).toEqual([
      ['This month', 4],
    ]);
  });

  it('never folds a recent section into a calendar month', () => {
    expect(shape([play('A', 0), play('B', 40)])).toEqual([
      ['Today', 1],
      ['September 2026', 1],
    ]);
  });
});
