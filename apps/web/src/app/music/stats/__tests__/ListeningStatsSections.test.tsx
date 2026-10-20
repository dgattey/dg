import type { ListeningStats, StatsAlbum } from '@dg/services/spotify/fetchListeningStats';
import { render, screen } from '@testing-library/react';
import { ListeningStatsSections } from '../ListeningStatsSections';

const album = (id: string): StatsAlbum => ({
  artistNames: `Artist ${id}`,
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  name: `Album ${id}`,
  url: `https://open.spotify.com/album/${id}`,
});

const track = (id: string) => ({
  artistNames: `Artist ${id}`,
  id,
  name: `Track ${id}`,
  url: `https://open.spotify.com/track/${id}`,
});

const hours = Array.from({ length: 24 }, (_, hour) => 100 + hour);
hours[15] = 25_806;
hours[16] = 25_500;

const stats: ListeningStats = {
  activeDays: 90,
  activeMonths: 4,
  artists: 12,
  dayRepeats: [{ day: '2022-01-28', plays: 21, track: track('blessings') }],
  depth: [{ months: 4, name: 'Burna Boy', plays: 400, tracks: 20 }],
  firstPlayedAt: '2011-07-29T19:00:00.000Z',
  frontToBack: [{ album: album('dreamland'), plays: 100, sessionPlays: 87, sessions: 7 }],
  hours,
  lastPlayedAt: '2026-08-07T19:00:00.000Z',
  minutesPerPlay: 3.92,
  monthStreak: { end: '2011-10', months: 4, start: '2011-07' },
  onRepeat: [{ plays: 36, track: track('jet-pack'), week: '2017-05-29' }],
  plays: 1_000,
  sessionPlays: 240,
  sessions: 30,
  shelf: { albums: 3, plays: 80, topTenOnShelf: 1 },
  spanDays: 100,
  topAlbums: [{ album: album('apart'), plays: 120 }],
  tracks: 300,
  weekdays: [10, 20, 30, 40, 15, 5, 8],
  years: [
    { plays: 400, year: 2011 },
    { plays: 600, year: 2012 },
  ],
};

describe('ListeningStatsSections', () => {
  it('draws every card from paper tones the music pages already use', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const tones = new Set(
      [...container.querySelectorAll<HTMLElement>('.paperWrap')].map((card) =>
        card.style.getPropertyValue('--pc'),
      ),
    );
    const allowed = ['black', 'cream', 'ochre', 'rose', 'vermilion', 'viridian'].map(
      (tone) => `var(--${tone})`,
    );

    expect([...tones].filter((tone) => !allowed.includes(tone))).toEqual([]);
  });

  it('labels only the busiest hour, so neighbouring labels never collide', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const labels = [...container.querySelectorAll('.stats__hourValue')]
      .map((label) => label.textContent)
      .filter(Boolean);

    expect(labels).toEqual(['25.8k']);
  });

  it('names each card with a heading', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(
      expect.arrayContaining([
        'Plays per year',
        'Top albums, all time',
        'On repeat',
        'Front to back',
        'Day of week',
      ]),
    );
  });
});
