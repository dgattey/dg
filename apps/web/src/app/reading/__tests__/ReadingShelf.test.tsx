import { FALLBACK_BOOKS } from '@dg/content-models/books/fallbackBooks';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingShelf } from '../ReadingShelf';
import {
  buildYearGroups,
  filterAndSortBooks,
  formatFinishedMonthYear,
  formatRailStarSummary,
  splitReviewIntoPullAndRest,
} from '../readingHelpers';

describe('readingHelpers', () => {
  it('formats finished dates in sentence case with abbreviated month, day, and year', () => {
    expect(formatFinishedMonthYear('2026-09-16T00:00:00Z')).toBe('Sep 16, 2026');
    expect(formatFinishedMonthYear('2025-09-01T00:00:00Z')).toBe('Sep 1, 2025');
    expect(formatFinishedMonthYear('2025-01')).toBe('Jan 2025');
    expect(formatFinishedMonthYear(null)).toBeNull();
  });

  it('splits review into an opening pull sentence and remaining text', () => {
    const { pullQuote, restText } = splitReviewIntoPullAndRest(
      'My gut reaction was negativity - too much religion. But I stepped back and thought more deeply.',
    );
    expect(pullQuote).toBe('My gut reaction was negativity - too much religion.');
    expect(restText).toBe('But I stepped back and thought more deeply.');
  });

  it('formats rail star summary', () => {
    expect(formatRailStarSummary(3.75)).toBe('★★★★☆ 3.8 average');
    expect(formatRailStarSummary(5)).toBe('★★★★★ 5.0 average');
    expect(formatRailStarSummary(null)).toBeNull();
  });

  it('groups books by year excluding the latest feature book from streamBooks while preserving totalCount', () => {
    const ordered = filterAndSortBooks(FALLBACK_BOOKS, 'newest');
    const latest = ordered[0];
    const groups = buildYearGroups(ordered, ordered, latest?.id ?? null);

    const group2026 = groups.find((g) => g.year === '2026');
    expect(group2026).toBeDefined();
    expect(group2026?.totalCount).toBe(4);
    expect(group2026?.streamBooks).toHaveLength(3);
    expect(group2026?.includesLatest).toBe(true);
  });
});

describe('ReadingShelf', () => {
  it('renders the latest feature card, year rails, and stream cards', () => {
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Reading' })).toBeInTheDocument();
    const featureCard = screen.getByLabelText(/Latest read:/i);
    expect(
      within(featureCard).getByRole('heading', {
        level: 2,
        name: /The Path Made Clear/i,
      }),
    ).toBeInTheDocument();
    expect(within(featureCard).getByText('Oprah Winfrey')).toBeInTheDocument();
    expect(within(featureCard).getByText('Latest read')).toBeInTheDocument();
    expect(within(featureCard).getByText('Finished Sep 16, 2026')).toBeInTheDocument();

    const section2026 = screen.getByRole('region', { name: 'Books finished in 2026' });
    expect(within(section2026).getByText('4 books')).toBeInTheDocument();
    expect(within(section2026).getByText('Latest read is up top')).toBeInTheDocument();
    expect(
      within(section2026).getByRole('heading', { level: 3, name: 'Theo of Golden' }),
    ).toBeInTheDocument();
  });

  it('filters to five-star reads when Five stars pill is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    const fiveStarsButton = screen.getByRole('button', { name: 'Five stars' });
    await user.click(fiveStarsButton);
    expect(fiveStarsButton).toHaveAttribute('aria-pressed', 'true');

    const featureCard = screen.getByLabelText(/Latest read:/i);
    expect(
      within(featureCard).getByRole('heading', { level: 2, name: 'Pachinko' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Theo of Golden' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
  });

  it('filters to books with reviews when With notes pill is clicked', async () => {
    const user = userEvent.setup();
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    await user.click(screen.getByRole('button', { name: 'With notes' }));
    expect(screen.queryByRole('heading', { name: 'Pachinko' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
  });
});
