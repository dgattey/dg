import { FALLBACK_BOOKS } from '@dg/content-models/books/fallbackBooks';
import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingShelf } from '../ReadingShelf';
import {
  bookCardKind,
  featuredBook,
  formatFinishedDate,
  readingFilterOptions,
  shelfSections,
  shelfStats,
  sortBooks,
} from '../readingHelpers';

const IN_PROGRESS: RenderableBook = {
  author: 'Ursula K. Le Guin',
  id: 'in-progress',
  rating: null,
  readDateFinished: null,
  readingStatus: 'reading',
  review: null,
  thumbnail: null,
  title: 'The Dispossessed',
};

describe('readingHelpers', () => {
  it('formats finished dates with or without the year', () => {
    expect(formatFinishedDate('2026-09-16T00:00:00Z', { withYear: true })).toBe('Sep 16, 2026');
    expect(formatFinishedDate('2025-01-04T00:00:00Z', { withYear: false })).toBe('Jan 4');
    expect(formatFinishedDate(null, { withYear: true })).toBeNull();
  });

  it('only offers filters that narrow the shelf', () => {
    expect(readingFilterOptions(FALLBACK_BOOKS).map(({ label }) => label)).toEqual([
      'All',
      '5 stars',
      'Notes',
    ]);
    expect(
      readingFilterOptions([IN_PROGRESS, ...FALLBACK_BOOKS]).map(({ label }) => label),
    ).toEqual(['All', 'Reading', 'Finished', '5 stars', 'Notes']);
  });

  it('features the book in progress, else the newest review', () => {
    expect(featuredBook(sortBooks(FALLBACK_BOOKS))).toMatchObject({
      book: { title: expect.stringMatching(/^The Path Made Clear/) },
      tag: 'Latest review',
    });
    expect(featuredBook(sortBooks([...FALLBACK_BOOKS, IN_PROGRESS]))).toMatchObject({
      book: { id: 'in-progress' },
      tag: 'Currently reading',
    });
  });

  it('gives five-star reviews a wide card, other reviews a half card, and bare ratings a print', () => {
    const byTitle = (title: string) => {
      const book = FALLBACK_BOOKS.find((candidate) => candidate.title === title);
      if (!book) {
        throw new Error(`Missing fallback book ${title}`);
      }
      return book;
    };
    expect(bookCardKind(byTitle('Dune'))).toBe('feature');
    expect(bookCardKind(byTitle('Theo of Golden'))).toBe('review');
    expect(bookCardKind(byTitle('Pachinko'))).toBe('cover');
    expect(bookCardKind(IN_PROGRESS)).toBe('cover');
  });

  it('counts the shelf and its five-star books', () => {
    expect(shelfStats(FALLBACK_BOOKS)).toEqual({ fiveStars: 5, total: 23 });
  });

  it('groups the shelf into a reading section and then years, newest first', () => {
    const labels = shelfSections(sortBooks([...FALLBACK_BOOKS, IN_PROGRESS])).map(
      ({ label }) => label,
    );
    expect(labels).toEqual(['Currently reading', '2026', '2025', '2024', '2023']);
  });
});

describe('ReadingShelf', () => {
  it('features the latest review and shelves the rest by year', () => {
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    expect(screen.getByText('Latest review')).toBeInTheDocument();
    expect(screen.getByText('23 books · 5 five-star picks')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /^The Path Made Clear/ }),
    ).toBeInTheDocument();

    const year2026 = screen.getByRole('region', { name: '2026' });
    expect(
      within(year2026).getByRole('heading', { level: 3, name: 'Theo of Golden' }),
    ).toBeInTheDocument();
    expect(
      within(year2026).queryByRole('heading', { name: /^The Path Made Clear/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: '5 out of 5 stars' }).length).toBeGreaterThan(0);
  });

  it('narrows to five-star books and drops the feature when 5 stars is picked', async () => {
    const user = userEvent.setup();
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    const fiveStars = screen.getByRole('button', { name: /^5 stars/ });
    await user.click(fiveStars);

    expect(fiveStars).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Latest review')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Theo of Golden' })).not.toBeInTheDocument();
  });

  it('narrows to books with notes when Notes is picked', async () => {
    const user = userEvent.setup();
    render(<ReadingShelf books={FALLBACK_BOOKS} />);

    await user.click(screen.getByRole('button', { name: /^Notes/ }));

    expect(screen.queryByRole('heading', { name: 'Pachinko' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
  });
});
