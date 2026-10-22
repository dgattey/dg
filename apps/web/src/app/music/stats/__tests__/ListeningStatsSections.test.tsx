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
  topAlbums: [
    { album: album('apart'), plays: 120 },
    { album: album('rush'), plays: 90 },
    { album: album('avalanche'), plays: 80 },
  ],
  tracks: 300,
  weekdays: [10, 20, 30, 40, 15, 5, 8],
  years: [
    { plays: 400, year: 2011 },
    { plays: 600, year: 2012 },
  ],
};

describe('ListeningStatsSections', () => {
  it('draws every card and cut from paper tones the collage pages already use', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const tones = new Set(
      [...container.querySelectorAll<HTMLElement>('.paperWrap, .stats__cut, .paperTag')].map(
        (card) => card.style.getPropertyValue('--pc'),
      ),
    );
    const allowed = ['black', 'cobalt', 'cream', 'ochre', 'rose', 'vermilion', 'viridian'].map(
      (tone) => `var(--${tone})`,
    );

    expect([...tones].filter((tone) => !allowed.includes(tone))).toEqual([]);
  });

  it('labels only the busiest hour on the clock, so neighbouring labels never collide', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    expect(container.querySelectorAll('.stats__wedge')).toHaveLength(24);
    expect(
      [...container.querySelectorAll('.stats__clockValue')].map((label) => label.textContent),
    ).toEqual(['25.8k']);
    expect(screen.getByText('Peak 3 to 5 PM')).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.stats__clockTick')].map((tick) => tick.textContent),
    ).toEqual(['6a', '12p', '6p', '12a']);
  });

  it('says how far back the history goes', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(screen.getByText('Plays since Jul 2011')).toBeInTheDocument();
  });

  it('cuts the totals into stubs, stamps, and seals instead of matching boxes', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const totals = container.querySelector('[aria-label="Totals"]');
    const kinds = ['.stats__ticket', '.stats__stamp', '.stats__scallop'].map(
      (kind) => totals?.querySelectorAll(kind).length,
    );

    expect(kinds).toEqual([2, 2, 2]);
  });

  it('spotlights the top album on a record and ranks the runners-up with stickers', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const podium = container.querySelector('.stats__podium');

    expect(podium?.querySelector('.stats__hero .stats__vinyl')).not.toBeNull();
    expect(screen.getByText('Album apart')).toBeInTheDocument();
    expect(
      [...(podium?.querySelectorAll('.stats__rankSticker') ?? [])].map((s) => s.textContent),
    ).toEqual(['#02', '#03']);
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
