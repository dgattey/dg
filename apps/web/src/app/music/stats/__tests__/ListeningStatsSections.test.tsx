import type { ListeningStats, StatsAlbum } from '@dg/services/spotify/fetchListeningStats';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  dayStreak: { days: 14, end: '2024-03-14', start: '2024-03-01' },
  depth: [{ months: 4, name: 'Burna Boy', plays: 400, tracks: 20 }],
  firstPlayedAt: '2011-07-29T19:00:00.000Z',
  frontToBack: [{ album: album('dreamland'), plays: 100, sessionPlays: 87, sessions: 7 }],
  hours,
  lastPlayedAt: '2026-08-07T19:00:00.000Z',
  minutesPerPlay: 3.92,
  monthlyPlays: [
    { month: 7, plays: 180, year: 2011 },
    { month: 8, plays: 220, year: 2011 },
    { month: 3, plays: 600, year: 2012 },
  ],
  monthStreak: { end: '2011-10', months: 4, start: '2011-07' },
  onRepeat: [{ plays: 36, track: track('jet-pack'), week: '2017-05-29' }],
  plays: 1_000,
  range: { kind: 'all' },
  sessionPlays: 240,
  sessions: 30,
  shelf: { albums: 3, plays: 80, topTenOnShelf: 1 },
  spanDays: 100,
  topAlbums: [
    { album: album('apart'), plays: 120 },
    { album: album('rush'), plays: 90 },
    { album: album('avalanche'), plays: 80 },
  ],
  topArtists: [
    {
      id: 'artist-burna',
      months: 4,
      name: 'Burna Boy',
      plays: 400,
      tracks: 20,
      url: 'https://open.spotify.com/artist/burna',
    },
    {
      id: 'artist-odesza',
      months: 3,
      name: 'ODESZA',
      plays: 280,
      tracks: 14,
      url: 'https://open.spotify.com/artist/odesza',
    },
  ],
  topTracks: [
    {
      albumImageUrl: 'https://i.scdn.co/image/apart',
      albumName: 'A Moment Apart',
      artistNames: 'ODESZA',
      id: 'track-line-of-sight',
      name: 'Line Of Sight',
      plays: 94,
      url: 'https://open.spotify.com/track/line-of-sight',
    },
    {
      albumImageUrl: 'https://i.scdn.co/image/rush',
      albumName: 'The Slow Rush',
      artistNames: 'Tame Impala',
      id: 'track-breathe-deeper',
      name: 'Breathe Deeper',
      plays: 78,
      url: 'https://open.spotify.com/track/breathe-deeper',
    },
  ],
  tracks: 300,
  weekdays: [10, 20, 30, 40, 15, 5, 8],
  yearChampions: [
    {
      track: {
        albumImageUrl: 'https://i.scdn.co/image/apart',
        albumName: 'A Moment Apart',
        artistNames: 'ODESZA',
        id: 'track-line-of-sight',
        name: 'Line Of Sight',
        plays: 62,
        url: 'https://open.spotify.com/track/line-of-sight',
      },
      year: 2012,
    },
  ],
  years: [
    { plays: 400, year: 2011 },
    { plays: 600, year: 2012 },
  ],
};

describe('ListeningStatsSections', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/music/stats');
  });

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
    expect(container.querySelectorAll('.stats__taped')).toHaveLength(0);
  });

  it('links prominently to Plays and Favorite albums from the stats toolbar and totals', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(screen.getByRole('link', { name: 'Plays' })).toHaveAttribute('href', '/music');
    expect(screen.getByRole('link', { name: 'Favorite albums' })).toHaveAttribute(
      'href',
      '/music/albums',
    );
  });

  it('labels only the busiest hour on the clock by default and updates on hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const wedges = container.querySelectorAll('.stats__wedge');
    expect(wedges).toHaveLength(24);
    expect(
      [...container.querySelectorAll('.stats__clockValue')].map((label) => label.textContent),
    ).toEqual(['25.8k']);
    expect(screen.getByText('Peak 3 to 5 PM')).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.stats__clockTick')].map((tick) => tick.textContent),
    ).toEqual(['6a', '12p', '6p', '12a']);

    const firstWedge = wedges[0];
    if (!firstWedge) {
      throw new Error('Expected clock wedge');
    }
    await user.hover(firstWedge);
    expect(screen.getByText(/12 to 1 AM/)).toBeInTheDocument();
  });

  it('says how far back the history goes and adapts totals when filtered by range or Year dropdown', async () => {
    const user = userEvent.setup();
    const onLoadRange = jest.fn().mockImplementation(async (key: string) => ({
      ...stats,
      plays: 420,
      range: key === 'week' ? { kind: 'week' } : { kind: 'year', year: Number(key) },
    }));

    const { container } = render(
      <ListeningStatsSections onLoadRange={onLoadRange} stats={stats} />,
    );

    expect(screen.getByText('Plays since Jul 2011')).toBeInTheDocument();
    expect(container.querySelector('.stats__yearRail')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Last week' }));
    await waitFor(() => {
      expect(screen.getByText('Plays last week')).toBeInTheDocument();
    });
    expect(screen.getByText('Days in a row')).toBeInTheDocument();

    const yearDetails = container.querySelector<HTMLDetailsElement>('.stats__yearMenu');
    if (!yearDetails) {
      throw new Error('Expected Year dropdown menu');
    }
    yearDetails.open = true;
    const year2012Btn = container.querySelector<HTMLButtonElement>(
      'button[data-year-option="2012"]',
    );
    if (!year2012Btn) {
      throw new Error('Expected 2012 option button');
    }
    await user.click(year2012Btn);
    await waitFor(() => {
      expect(screen.getByText('Plays in 2012')).toBeInTheDocument();
    });
  });

  it('cuts the totals into stubs, stamps, and seals in a 2D collage mosaic', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const totals = container.querySelector('[aria-label="Totals"]');
    const kinds = ['.stats__ticket', '.stats__stamp', '.stats__scallop'].map(
      (kind) => totals?.querySelectorAll(kind).length,
    );

    expect(kinds).toEqual([2, 2, 2]);
  });

  it('spotlights the top album on a record and renders first-class Top songs and Top artists cards', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const podium = container.querySelector('.stats__podium');

    expect(podium?.querySelector('.stats__hero .stats__vinyl')).not.toBeNull();
    expect(screen.getByText('Album apart')).toBeInTheDocument();
    expect(
      [...(podium?.querySelectorAll('.stats__rankSticker') ?? [])].map((s) => s.textContent),
    ).toEqual(['#02', '#03']);

    expect(screen.getAllByRole('link', { name: 'Line Of Sight' })[0]).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/line-of-sight',
    );
    expect(screen.getByRole('link', { name: 'Burna Boy' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/artist/burna',
    );
  });

  it('updates Plays per year, Every month, and Day of week readouts on hover with zero instructional copy', async () => {
    const user = userEvent.setup();
    const { container } = render(<ListeningStatsSections stats={stats} />);

    expect(screen.queryByText('One track, one day')).not.toBeInTheDocument();
    expect(screen.queryByText(/Hover or tap/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hover a petal/i)).not.toBeInTheDocument();

    const year2011 = screen.getByLabelText('2011: 400 plays');
    await user.hover(year2011);
    expect(screen.getByText(/2011: 400 plays/)).toBeInTheDocument();

    const july2011 = screen.getByLabelText('Jul 2011: 180 plays');
    await user.hover(july2011);
    expect(container.querySelector('.stats__monthReadout')).toHaveTextContent(
      'Jul 2011: 180 plays',
    );

    const mondayChip = screen.getByText('Mon');
    await user.hover(mondayChip);
    expect(container.querySelector('.stats__weekReadout')).toHaveTextContent('Monday: 10 plays');
  });

  it('names each card with a heading including Every month and Soundtrack by year', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(
      expect.arrayContaining([
        'Plays per year',
        'Every month',
        'Soundtrack by year',
        'Top albums, all time',
        'Top songs, all time',
        'Top artists, all time',
        'On repeat',
        'Front to back',
        'Day of week',
      ]),
    );
  });
});
