import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { groupAdjacentAlbumPlays } from '../groupAdjacentAlbumPlays';
import { groupTracksByDate } from '../groupTracksByDate';

/** Thursday noon in Los Angeles. */
const NOW = Date.parse('2026-10-22T12:00:00-07:00');

function playAt(album: string, playedAt: string, index = 0): HistoryTrack {
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    newArtist: null,
    playedAt,
    trackId: `track-${album}-${playedAt}-${index}`,
    trackName: `${album} ${index}`,
    url: `https://open.spotify.com/track/${album}`,
  };
}

function play(album: string, daysAgo: number, minute = 0): HistoryTrack {
  const playedAt = new Date(NOW - daysAgo * 86_400_000 - minute * 60_000);
  return playAt(album, playedAt.toISOString(), minute);
}

/** `count` consecutive plays of one album, newest first, ending `daysAgo` at `startMinute`. */
function albumRun(album: string, count: number, daysAgo: number, startMinute: number) {
  return Array.from({ length: count }, (_, index) => play(album, daysAgo, startMinute + index));
}

const shape = (tracks: Array<HistoryTrack>) =>
  groupTracksByDate(tracks, NOW).map((section) => [section.label, section.tracks.length]);

const cards = (tracks: Array<HistoryTrack>) =>
  groupTracksByDate(tracks, NOW).map((section) => [
    section.label,
    groupAdjacentAlbumPlays(section.tracks).map((run) => `${run.albumName}×${run.tracks.length}`),
  ]);

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

  it('labels a folded section with the broader window and joins the album run at the seam', () => {
    const tracks = [
      play('A', 0),
      ...albumRun('B', 3, 0, 1),
      ...albumRun('B', 2, 1, 0),
      play('C', 1, 5),
      play('D', 1, 6),
    ];

    expect(cards(tracks)).toEqual([['This week', ['A×1', 'B×5', 'C×1', 'D×1']]]);
  });

  it('keeps one today when a day of plays spans two loaded pages', () => {
    const firstPage = [...albumRun('Mat Kearney', 11, 0, 0), ...albumRun('CTRL ESCAPE', 13, 0, 11)];
    const secondPage = [
      ...albumRun('CTRL ESCAPE', 2, 0, 24),
      play('The Greatest Show On Earth', 0, 26),
      ...albumRun('Open Late', 8, 0, 27),
      play('USB', 1),
    ];

    expect(cards([...firstPage, ...secondPage])).toEqual([
      [
        'Today',
        ['Mat Kearney×11', 'CTRL ESCAPE×15', 'The Greatest Show On Earth×1', 'Open Late×8'],
      ],
      ['This week', ['USB×1']],
    ]);
  });

  it('never repeats a label for any newest-first history', () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    for (let trial = 0; trial < 200; trial++) {
      const offsets = Array.from({ length: 1 + Math.floor(random() * 60) }, () =>
        Math.floor(random() * 90 * 86_400_000),
      ).sort((a, b) => a - b);
      const tracks = offsets.map((offset, index) =>
        playAt(`album-${Math.floor(random() * 4)}`, new Date(NOW - offset).toISOString(), index),
      );
      const labels = groupTracksByDate(tracks, NOW).map((section) => section.label);

      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it('ends today at midnight in Los Angeles, not UTC', () => {
    const lateEvening = Date.parse('2026-10-21T23:30:00-07:00');
    const tracks = [
      playAt('A', '2026-10-21T16:00:00-07:00'),
      playAt('B', '2026-10-21T15:00:00-07:00'),
      playAt('C', '2026-10-21T14:00:00-07:00'),
      playAt('D', '2026-10-20T23:30:00-07:00'),
    ];

    expect(
      groupTracksByDate(tracks, lateEvening).map((section) => [
        section.label,
        section.tracks.length,
      ]),
    ).toEqual([
      ['Today', 3],
      ['This week', 1],
    ]);
  });

  it('starts the week on Monday in Los Angeles, not UTC', () => {
    expect(
      shape([
        playAt('A', '2026-10-22T09:00:00-07:00'),
        playAt('B', '2026-10-22T08:00:00-07:00'),
        playAt('C', '2026-10-22T07:00:00-07:00'),
        playAt('D', '2026-10-19T00:30:00-07:00'),
        playAt('E', '2026-10-19T00:20:00-07:00'),
        playAt('F', '2026-10-19T00:10:00-07:00'),
        playAt('G', '2026-10-18T23:30:00-07:00'),
      ]),
    ).toEqual([
      ['Today', 3],
      ['This week', 3],
      ['This month', 1],
    ]);
  });
});
