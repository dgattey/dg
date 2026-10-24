import type {
  ListeningStats,
  StatsAlbum,
  StatsTrack,
} from '@dg/services/spotify/fetchListeningStats';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListeningStatsSections } from '../ListeningStatsSections';

const artist = (id: string, name = `Artist ${id}`) => ({
  id,
  name,
  url: `https://open.spotify.com/artist/${id}`,
});

const album = (id: string, isFavorite = false): StatsAlbum => ({
  artists: [artist(`by-${id}`)],
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  isFavorite,
  name: `Album ${id}`,
  url: `https://open.spotify.com/album/${id}`,
});

const track = (id: string, name = `Track ${id}`, by = artist(`by-${id}`)): StatsTrack => ({
  album: album(`of-${id}`),
  artists: [by],
  id,
  name,
  url: `https://open.spotify.com/track/${id}`,
});

const hours = Array.from({ length: 24 }, (_, hour) => 100 + hour);
hours[15] = 25_806;
hours[16] = 25_500;

const stats: ListeningStats = {
  activeDays: 90,
  activeMonths: 4,
  artists: 12,
  champions: {
    aside: '#1 song each year',
    entries: [
      {
        badge: '2012',
        key: '2012',
        track: {
          ...track('line-of-sight', 'Line Of Sight', artist('odesza', 'ODESZA')),
          plays: 62,
        },
        yearFilter: 2012,
      },
    ],
    title: 'Soundtrack by year',
  },
  dayStreak: { days: 14, end: '2024-03-14', start: '2024-03-01' },
  firstPlayedAt: '2011-07-29T19:00:00.000Z',
  frontToBack: [{ album: album('dreamland'), plays: 100, sessionPlays: 87, sessions: 7 }],
  genres: [
    {
      artists: [artist('burna', 'Burna Boy'), artist('fireboy', 'Fireboy DML')],
      genre: 'afrobeats',
      plays: 420,
      tracks: 28,
    },
    {
      artists: [artist('odesza', 'ODESZA'), artist('tycho', 'Tycho')],
      genre: 'chillwave',
      plays: 310,
      tracks: 19,
    },
  ],
  hours,
  lastPlayedAt: '2026-08-07T19:00:00.000Z',
  matrix: {
    columns: [
      { full: 'Jan', key: 'Jan', short: 'J' },
      { full: 'Jul', key: 'Jul', short: 'J' },
      { full: 'Aug', key: 'Aug', short: 'A' },
    ],
    peakCell: { key: '2012-03', label: 'Mar 2012', plays: 600 },
    rows: [
      {
        cells: [
          { key: '2011-01', label: 'Jan 2011', phase: 'past', plays: 0, yearFilter: 2011 },
          { key: '2011-07', label: 'Jul 2011', phase: 'past', plays: 180, yearFilter: 2011 },
          { key: '2011-08', label: 'Aug 2011', phase: 'current', plays: 220, yearFilter: 2011 },
        ],
        key: '2011',
        label: '’11',
        yearFilter: 2011,
      },
    ],
    title: 'Every month',
  },
  minutesPerPlay: 3.92,
  monthStreak: { end: '2011-10', months: 4, start: '2011-07' },
  newArtists: { ids: ['fireboy'], label: 'New artist this year' },
  onRepeat: [{ plays: 36, track: track('jet-pack'), week: '2017-05-29' }],
  plays: 1_000,
  range: { kind: 'all' },
  sessionPlays: 240,
  sessions: 30,
  shelf: { albums: 3, plays: 80 },
  spanDays: 100,
  timeline: {
    points: [
      { key: '2011', label: '2011', phase: 'past', plays: 400, tick: '’11', yearFilter: 2011 },
      { key: '2012', label: '2012', phase: 'current', plays: 600, tick: '’12', yearFilter: 2012 },
      { key: '2013', label: '2013', phase: 'future', plays: 0, tick: '’13', yearFilter: 2013 },
    ],
    title: 'Plays per year',
  },
  topAlbums: [
    { album: album('apart', true), plays: 120 },
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
    { ...track('line-of-sight', 'Line Of Sight', artist('odesza', 'ODESZA')), plays: 94 },
    { ...track('breathe-deeper', 'Breathe Deeper', artist('tame', 'Tame Impala')), plays: 78 },
  ],
  tracks: 300,
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
    const nav = within(screen.getByRole('navigation', { name: 'Explore music' }));

    expect(nav.getByRole('link', { name: 'Plays' })).toHaveAttribute('href', '/music');
    expect(nav.getByRole('link', { name: 'Favorite albums' })).toHaveAttribute(
      'href',
      '/music/albums',
    );
  });

  it('opens a favorite album in place and every other album, song, and artist on Spotify', () => {
    render(<ListeningStatsSections stats={stats} />);

    for (const link of screen.getAllByRole('link', { name: 'Album apart' })) {
      expect(link).toHaveAttribute('href', '/music/albums?album=apart');
    }
    for (const link of screen.getAllByRole('link', { name: 'Album rush' })) {
      expect(link).toHaveAttribute('href', 'https://open.spotify.com/album/rush');
    }
    for (const link of screen.getAllByRole('link', { name: 'Artist by-rush' })) {
      expect(link).toHaveAttribute('href', 'https://open.spotify.com/artist/by-rush');
    }
    expect(screen.getAllByRole('link', { name: 'Track jet-pack' })[0]).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/jet-pack',
    );
    expect(screen.getByRole('link', { name: 'Album of-jet-pack' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/of-jet-pack',
    );
  });

  it('tags artists first played in this window as new', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(screen.getAllByRole('img', { name: 'New artist this year' })).toHaveLength(1);
  });

  it('leaves periods that have not happened yet as inert placeholders', () => {
    const { container } = render(<ListeningStatsSections stats={stats} />);

    expect(screen.getByLabelText('2013: not here yet')).toHaveClass('stats__column--future');
    expect(screen.queryByText(/2013: 0 plays/)).not.toBeInTheDocument();
    expect(container.querySelectorAll('.stats__column--current')).toHaveLength(1);
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

  it('switches immediately using preloaded snapshots or onLoadRange when filtered by range or Year dropdown', async () => {
    const user = userEvent.setup();
    const weekSnapshot: ListeningStats = {
      ...stats,
      champions: { ...stats.champions, title: 'Soundtrack by day' },
      matrix: { ...stats.matrix, title: 'Every day & shift' },
      plays: 142,
      range: { kind: 'week' },
      timeline: { ...stats.timeline, title: 'Plays per day, this week' },
    };
    const onLoadRange = jest.fn().mockImplementation(async (key: string) => ({
      ...stats,
      champions: { ...stats.champions, title: 'Soundtrack by month' },
      matrix: { ...stats.matrix, title: `Every week of ${key}` },
      plays: 420,
      range: { kind: 'year', year: Number(key) },
      timeline: { ...stats.timeline, title: `Plays per month, ${key}` },
    }));

    const { container } = render(
      <ListeningStatsSections
        initialSnapshots={{ all: stats, week: weekSnapshot }}
        onLoadRange={onLoadRange}
        stats={stats}
      />,
    );

    expect(screen.getByText('Plays since Jul 2011')).toBeInTheDocument();
    expect(container.querySelector('.stats__yearRail')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(screen.getByText('Plays this week')).toBeInTheDocument();
    expect(screen.getByText('Plays per day, this week')).toBeInTheDocument();
    expect(screen.getByText('Every day & shift')).toBeInTheDocument();
    expect(screen.getByText('Soundtrack by day')).toBeInTheDocument();
    expect(onLoadRange).not.toHaveBeenCalledWith('week');

    const yearDetails = container.querySelector<HTMLDetailsElement>('.yearMenu');
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
    expect(screen.getByText('Plays per month, 2012')).toBeInTheDocument();
    expect(screen.getByText('Every week of 2012')).toBeInTheDocument();
    expect(screen.getByText('Soundtrack by month')).toBeInTheDocument();
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
    for (const link of screen.getAllByRole('link', { name: 'Burna Boy' })) {
      expect(link).toHaveAttribute('href', 'https://open.spotify.com/artist/burna');
    }
  });

  it('updates Plays per year, Every month, and Genres readouts on hover with zero instructional copy', async () => {
    const user = userEvent.setup();
    const { container } = render(<ListeningStatsSections stats={stats} />);

    expect(screen.queryByText('Day of week')).not.toBeInTheDocument();
    expect(screen.queryByText('One track, one day')).not.toBeInTheDocument();
    expect(screen.queryByText(/Hover or tap/i)).not.toBeInTheDocument();

    const year2011 = screen.getByLabelText('2011: 400 plays');
    await user.hover(year2011);
    expect(screen.getByText(/2011: 400 plays/)).toBeInTheDocument();

    const july2011 = screen.getByLabelText('Jul 2011: 180 plays');
    await user.hover(july2011);
    expect(container.querySelector('.stats__monthReadout')).toHaveTextContent(
      'Jul 2011: 180 plays',
    );

    const afrobeatsRow = screen.getAllByText('afrobeats')[0];
    if (!afrobeatsRow) {
      throw new Error('Expected afrobeats row');
    }
    await user.hover(afrobeatsRow);
    expect(container.querySelector('.stats__genreReadout')).toHaveTextContent(
      'afrobeats: 420 plays',
    );
  });

  it('names each card with a heading including Genres, Every month, and Soundtrack by year', () => {
    render(<ListeningStatsSections stats={stats} />);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(
      expect.arrayContaining([
        'Plays per year',
        'Genres, all time',
        'Every month',
        'Soundtrack by year',
        'Top albums, all time',
        'Top songs, all time',
        'Top artists, all time',
        'On repeat',
        'Front to back',
      ]),
    );
  });
});
