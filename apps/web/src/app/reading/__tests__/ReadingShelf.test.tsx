import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { formatUtcShortDate } from '@dg/shared-core/dates/periodStatus';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingShelf } from '../ReadingShelf';
import {
  bookCardKind,
  bookFilterKeys,
  featuredBook,
  readingFilterOptions,
  shelfSections,
  shelfStats,
  sortBooks,
} from '../readingHelpers';

const readingCss = readFileSync(join(__dirname, '..', 'reading.css'), 'utf8');
const chromeCss = readFileSync(join(__dirname, '..', '..', 'collage', 'chrome.css'), 'utf8');
const collageCss = readFileSync(join(__dirname, '..', '..', 'collage', 'collage.css'), 'utf8');

const SHELF_BOOKS: ReadonlyArray<RenderableBook> = [
  {
    author: 'Oprah Winfrey',
    id: 'goodreads-0',
    rating: 4,
    readDateFinished: '2026-09-16T00:00:00Z',
    readingStatus: 'read',
    review: 'A simple yet profound statement of compassion and positivity.',
    thumbnail: { height: 393, url: 'https://example.com/path.jpg', width: 318 },
    title: "The Path Made Clear: Discovering Your Life's Direction and Purpose",
  },
  {
    author: 'Allen Levi',
    id: 'goodreads-3',
    rating: 4,
    readDateFinished: '2026-09-05T00:00:00Z',
    readingStatus: 'read',
    review: 'Inspiring and heartwarming.',
    thumbnail: { height: 900, url: 'https://example.com/theo.jpg', width: 579 },
    title: 'Theo of Golden',
  },
  {
    author: 'Min Jin Lee',
    id: 'goodreads-4',
    rating: 5,
    readDateFinished: '2025-12-26T00:00:00Z',
    readingStatus: 'read',
    review: null,
    thumbnail: { height: 1500, url: 'https://example.com/pachinko.jpg', width: 987 },
    title: 'Pachinko',
  },
  {
    author: 'Frank Herbert',
    id: 'goodreads-5',
    rating: 5,
    readDateFinished: '2025-01-04T00:00:00Z',
    readingStatus: 'read',
    review: 'Wow, what an epic.',
    thumbnail: { height: 475, url: 'https://example.com/dune.jpg', width: 316 },
    title: 'Dune',
  },
  {
    author: 'Ayanna Lloyd Banwo',
    id: 'goodreads-17',
    rating: 5,
    readDateFinished: '2024-01-26T00:00:00Z',
    readingStatus: 'read',
    review: 'A magical experience.',
    thumbnail: { height: 400, url: 'https://example.com/birds.jpg', width: 265 },
    title: 'When We Were Birds',
  },
  {
    author: 'Chimamanda Ngozi Adichie',
    id: 'goodreads-18',
    rating: 5,
    readDateFinished: '2023-07-02T00:00:00Z',
    readingStatus: 'read',
    review: 'One of the best books I have ever read.',
    thumbnail: { height: 472, url: 'https://example.com/americanah.jpg', width: 318 },
    title: 'Americanah',
  },
];

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
    expect(formatUtcShortDate('2026-09-16T00:00:00Z', { withYear: true })).toBe('Sep 16, 2026');
    expect(formatUtcShortDate('2025-01-04T00:00:00Z', { withYear: false })).toBe('Jan 4');
    expect(formatUtcShortDate(null, { withYear: true })).toBeNull();
  });

  it('only offers filters that narrow the shelf', () => {
    expect(readingFilterOptions(SHELF_BOOKS).map(({ label }) => label)).toEqual([
      'All',
      '5 stars',
      'Notes',
    ]);
    expect(readingFilterOptions([IN_PROGRESS, ...SHELF_BOOKS]).map(({ label }) => label)).toEqual([
      'All',
      'Reading',
      'Finished',
      '5 stars',
      'Notes',
    ]);
    expect(bookFilterKeys(IN_PROGRESS)).toEqual(['reading']);
    expect(bookFilterKeys(SHELF_BOOKS[0] ?? IN_PROGRESS)).toEqual(['finished', 'notes']);
    expect(bookFilterKeys(SHELF_BOOKS[2] ?? IN_PROGRESS)).toEqual(['finished', 'fiveStars']);
    expect(bookFilterKeys(SHELF_BOOKS[3] ?? IN_PROGRESS)).toEqual([
      'finished',
      'fiveStars',
      'notes',
    ]);
  });

  it('features the book in progress, else the newest review', () => {
    expect(featuredBook(sortBooks(SHELF_BOOKS))).toMatchObject({
      book: { title: expect.stringMatching(/^The Path Made Clear/) },
      tag: 'Latest review',
    });
    expect(featuredBook(sortBooks([...SHELF_BOOKS, IN_PROGRESS]))).toMatchObject({
      book: { id: 'in-progress' },
      tag: 'Currently reading',
    });
  });

  it('gives five-star reviews a wide card, other reviews a half card, and bare ratings a print', () => {
    const byTitle = (title: string) => {
      const book = SHELF_BOOKS.find((candidate) => candidate.title === title);
      if (!book) {
        throw new Error(`Missing test book ${title}`);
      }
      return book;
    };
    expect(bookCardKind(byTitle('Dune'))).toBe('feature');
    expect(bookCardKind(byTitle('Theo of Golden'))).toBe('review');
    expect(bookCardKind(byTitle('Pachinko'))).toBe('cover');
    expect(bookCardKind(IN_PROGRESS)).toBe('cover');
  });

  it('counts the shelf and its five-star books', () => {
    expect(shelfStats(SHELF_BOOKS)).toEqual({ fiveStars: 4, total: 6 });
  });

  it('groups the shelf into a reading section, dated years newest first, and Earlier for undated reads', () => {
    const undatedRead: RenderableBook = {
      author: 'S.E. Hinton',
      id: 'outsiders',
      rating: 5,
      readDateFinished: null,
      readingStatus: 'read',
      review: null,
      thumbnail: null,
      title: 'The Outsiders',
    };
    const labels = shelfSections(sortBooks([...SHELF_BOOKS, undatedRead, IN_PROGRESS])).map(
      ({ label }) => label,
    );
    expect(labels).toEqual(['Currently reading', '2026', '2025', '2024', '2023', 'Earlier']);
  });
});

class MeasuredResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  disconnect() {}
  observe() {
    this.callback(
      [{ borderBoxSize: [{ blockSize: 57.4 }] } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
}

describe('ReadingShelf', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: MeasuredResizeObserver,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  });

  it('publishes the sticky filter bar height so year placards stop below it', () => {
    render(<ReadingShelf books={SHELF_BOOKS} />);

    const filters = screen.getByRole('button', { name: /^5 stars/ }).closest('[data-filter-bar]');
    expect(filters?.parentElement).toHaveStyle({ '--reading-filters-height': '58px' });
  });

  it('features the latest review and shelves the rest by year', () => {
    render(<ReadingShelf books={SHELF_BOOKS} />);

    expect(screen.getByText('Latest review')).toBeInTheDocument();
    expect(screen.getByText('6 books · 4 five-star picks')).toBeInTheDocument();
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
    render(<ReadingShelf books={SHELF_BOOKS} />);

    const fiveStars = screen.getByRole('button', { name: /^5 stars/ });
    await user.click(fiveStars);

    expect(fiveStars).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Latest review')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Theo of Golden' })).not.toBeInTheDocument();
  });

  it('narrows to books with notes when Notes is picked', async () => {
    const user = userEvent.setup();
    render(<ReadingShelf books={SHELF_BOOKS} />);

    await user.click(screen.getByRole('button', { name: /^Notes/ }));

    expect(screen.queryByRole('heading', { name: 'Pachinko' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toBeInTheDocument();
    const year2026 = screen.getByRole('region', { name: '2026' });
    expect(
      within(year2026).getByRole('heading', { level: 3, name: /^The Path Made Clear/ }),
    ).toBeInTheDocument();
    expect(within(year2026).getByText('2 books')).toBeInTheDocument();
  });

  it('keeps year section headings sticky with consistent width below the site header across desktop and mobile layouts', () => {
    const sectionBlock =
      readingCss.match(/\.reading__section\s*\{([\s\S]*?)\n\}\n\.reading__sectionHeading/)?.[1] ??
      '';
    const headingBlock =
      readingCss.match(
        /\.reading__sectionHeading\s*\{([\s\S]*?)\n\}\n\.reading__sectionTag/,
      )?.[1] ?? '';
    const tagBlock = readingCss.match(/\.reading__sectionTag\s*\{([^}]*)\}/)?.[1] ?? '';
    const mobileHeaderBlock =
      chromeCss.match(/@media\s*\(max-width:\s*480px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

    expect(sectionBlock).toContain('display: flex;');
    expect(sectionBlock).toContain('flex-direction: column;');
    expect(sectionBlock).toMatch(/@media\s*\(min-width:\s*1100px\)[\s\S]*?display:\s*grid;/);
    expect(sectionBlock).toMatch(
      /@media\s*\(min-width:\s*1100px\)[\s\S]*?grid-template-columns:\s*220px\s+minmax\(0,\s*1fr\);/,
    );
    expect(sectionBlock).toMatch(/@media\s*\(min-width:\s*1100px\)[\s\S]*?align-items:\s*start;/);

    expect(headingBlock).toContain('position: sticky;');
    expect(headingBlock).toContain('top: calc(var(--site-header-height, 80px) + 16px);');
    expect(headingBlock).toContain('z-index: 5;');
    expect(headingBlock).toContain('align-self: flex-start;');
    expect(headingBlock).toContain('width: 220px;');

    expect(tagBlock).toContain('display: flex;');
    expect(tagBlock).toContain('justify-content: space-between;');
    expect(tagBlock).toContain('width: 100%;');

    expect(mobileHeaderBlock).not.toContain('position: relative;');
    expect(collageCss).not.toContain('--site-header-height: 0px;');

    const clampBlock =
      readingCss.match(
        /\.reading__bookTitle,\s*\.reading__featureTitle,\s*\.reading__author\s*\{([^}]*)\}/,
      )?.[1] ?? '';
    expect(clampBlock).toContain('-webkit-line-clamp: 3;');
    expect(clampBlock).toContain('line-clamp: 3;');

    render(<ReadingShelf books={SHELF_BOOKS} />);
    expect(screen.getByRole('heading', { level: 2, name: /^The Path Made Clear/ })).toHaveAttribute(
      'title',
      "The Path Made Clear: Discovering Your Life's Direction and Purpose",
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Dune' })).toHaveAttribute(
      'title',
      'Dune',
    );
    expect(screen.getByText('Frank Herbert')).toHaveAttribute('title', 'Frank Herbert');
  });
});
