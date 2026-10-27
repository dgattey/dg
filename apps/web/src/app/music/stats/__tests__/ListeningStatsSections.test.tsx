import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListeningStatsSections } from '../ListeningStatsSections';
import { stats } from './listeningStatsFixture';

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

  it('draws This month as its calendar weeks, with blank spacers outside the month', () => {
    const playsByDay = new Map([
      ['2026-03-01', 4],
      ['2026-03-03', 9],
      ['2026-03-09', 2],
    ]);
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mondays = ['2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16', '2026-03-23'];
    const rows = [...mondays, '2026-03-30'].map((monday) => ({
      cells: weekdays.map((weekday, i) => {
        const day = new Date(Date.parse(`${monday}T12:00:00Z`) + i * 86_400_000)
          .toISOString()
          .slice(0, 10);
        const phase = day < '2026-03-09' ? 'past' : day === '2026-03-09' ? 'current' : 'future';
        return day.startsWith('2026-03')
          ? {
              key: day,
              label: `${weekday} ${Number(day.slice(8))} Mar 2026`,
              phase,
              plays: playsByDay.get(day) ?? 0,
            }
          : { blank: true, key: day, label: '', phase, plays: 0 };
      }),
      key: monday,
      label: monday === '2026-02-23' ? '1 Mar' : `${Number(monday.slice(8))} Mar`,
    })) satisfies ListeningStats['matrix']['rows'];
    const monthStats: ListeningStats = {
      ...stats,
      activeDays: 3,
      matrix: {
        columns: weekdays.map((day) => ({ full: day, key: day, short: day.charAt(0) })),
        peakCell: { key: '2026-03-03', label: 'Tue 3 Mar 2026', plays: 9 },
        rows,
        title: 'Every day, this month',
      },
      range: { kind: 'month' },
      spanDays: 9,
    };
    const { container } = render(<ListeningStatsSections stats={monthStats} />);
    const card = container.querySelector<HTMLElement>('.stats__monthly');
    if (!card) {
      throw new Error('Expected the activity matrix card');
    }

    const blanks = card.querySelectorAll('.stats__monthCell--blank');
    expect(blanks).toHaveLength(11);
    expect([...blanks].every((cell) => cell.tagName === 'SPAN')).toBe(true);
    expect(card.querySelectorAll('.stats__monthCell--future')).toHaveLength(22);
    expect(
      [...card.querySelectorAll('.stats__monthRowLabel')].map((label) => label.textContent),
    ).toEqual(['1 Mar', '2 Mar', '9 Mar', '16 Mar', '23 Mar', '30 Mar']);
    expect(card.querySelector('.stats__cardStamp')).toHaveTextContent('Active days3');
    expect(card.querySelector('.stats__monthReadout')).toHaveTextContent(
      'Peak Tue 3 Mar 2026: 9 plays',
    );
    expect(screen.getByText('3 of 9 days')).toBeInTheDocument();
  });

  it('labels only the busiest hour on the clock by default and updates on hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<ListeningStatsSections stats={stats} />);

    const wedges = container.querySelectorAll('.stats__wedge');
    expect(wedges).toHaveLength(24);
    expect(
      [...container.querySelectorAll('.stats__clockValue')].map((label) => label.textContent),
    ).toEqual(['25.8k']);
    expect(screen.getByText('Peak 3p–5p')).toBeInTheDocument();
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
    await user.click(within(yearDetails).getByRole('button', { name: '2012' }));
    await waitFor(() => {
      expect(screen.getByText('Plays in 2012')).toBeInTheDocument();
    });
    expect(screen.getByText('Plays per month, 2012')).toBeInTheDocument();
    expect(screen.getByText('Every week of 2012')).toBeInTheDocument();
    expect(screen.getByText('Soundtrack by month')).toBeInTheDocument();
  });

  it('counts Depth and loyalty in days for a week or month and in months for longer ranges', async () => {
    const user = userEvent.setup();
    const [burna, odesza] = stats.topArtists;
    if (!burna || !odesza) {
      throw new Error('Expected two top artists');
    }
    const weekSnapshot: ListeningStats = {
      ...stats,
      loyalty: { active: 6, possible: 7, unit: 'day' },
      range: { kind: 'week' },
      topArtists: [
        { ...burna, active: 5 },
        { ...odesza, active: 2 },
      ],
    };
    const monthSnapshot: ListeningStats = {
      ...stats,
      loyalty: { active: 1, possible: 1, unit: 'day' },
      range: { kind: 'month' },
      topArtists: [
        { ...burna, active: 1 },
        { ...odesza, active: 1 },
      ],
    };
    const { container } = render(
      <ListeningStatsSections
        initialSnapshots={{ all: stats, month: monthSnapshot, week: weekSnapshot }}
        stats={stats}
      />,
    );
    const depthCard = () => {
      const card = container.querySelector<HTMLElement>('.stats__depth');
      if (!card) {
        throw new Error('Expected the Depth and loyalty card');
      }
      return card;
    };
    const bars = () =>
      [...depthCard().querySelectorAll<HTMLElement>('.stats__loyalty .stats__meter')].map((meter) =>
        meter.style.getPropertyValue('--bar'),
      );

    expect(within(depthCard()).getByText('Active 4 of 6 months')).toBeInTheDocument();
    expect(within(depthCard()).getByRole('columnheader', { name: 'Months' })).toBeInTheDocument();
    expect(depthCard().querySelector('.stats__cardStamp')).toHaveTextContent('Loyal for4 months');
    expect(bars()).toEqual([String(4 / 6), String(3 / 6)]);

    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(within(depthCard()).getByText('Active 6 of 7 days')).toBeInTheDocument();
    expect(within(depthCard()).getByRole('columnheader', { name: 'Days' })).toBeInTheDocument();
    expect(depthCard().querySelector('.stats__cardStamp')).toHaveTextContent('Loyal for5 days');
    expect(bars()).toEqual([String(5 / 7), String(2 / 7)]);

    await user.click(screen.getByRole('button', { name: 'This month' }));
    expect(within(depthCard()).getByText('Active 1 of 1 day')).toBeInTheDocument();
    expect(within(depthCard()).getByRole('columnheader', { name: 'Days' })).toBeInTheDocument();
    expect(depthCard().querySelector('.stats__cardStamp')).toBeNull();
    expect(bars()).toEqual(['1', '1']);
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
    for (const link of screen.getAllByRole('link', { name: '#pumped' })) {
      expect(link).toHaveAttribute('href', 'https://open.spotify.com/playlist/playlist-pumped');
    }
    expect(screen.getByAltText('#pumped cover')).toHaveAttribute('width', '64');
    expect(screen.getByAltText('#pumped cover')).toHaveAttribute('height', '64');
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
        'Top playlists, all time',
        'On repeat',
        'Front to back',
      ]),
    );
  });
});
