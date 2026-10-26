import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';

type ReadingFilter = {
  label: string;
  matches: (book: RenderableBook) => boolean;
  tiltDeg: number;
};

const READING_FILTER_KEYS = ['all', 'reading', 'finished', 'fiveStars', 'notes'] as const;

export type ReadingFilterKey = (typeof READING_FILTER_KEYS)[number];

const READING_FILTERS: Record<ReadingFilterKey, ReadingFilter> = {
  all: { label: 'All', matches: () => true, tiltDeg: -2 },
  finished: { label: 'Finished', matches: (book) => book.readingStatus === 'read', tiltDeg: -1 },
  fiveStars: { label: '5 stars', matches: (book) => book.rating === 5, tiltDeg: 2 },
  notes: { label: 'Notes', matches: (book) => book.review !== null, tiltDeg: -1.5 },
  reading: {
    label: 'Reading',
    matches: (book) => book.readingStatus === 'reading',
    tiltDeg: 1.5,
  },
};

export type ReadingFilterOption = {
  count: number;
  key: ReadingFilterKey;
  label: string;
  tiltDeg: number;
};

/** Every non-`all` filter key matched by a single book. */
export function bookFilterKeys(book: RenderableBook): Array<Exclude<ReadingFilterKey, 'all'>> {
  return READING_FILTER_KEYS.filter(
    (key): key is Exclude<ReadingFilterKey, 'all'> =>
      key !== 'all' && READING_FILTERS[key].matches(book),
  );
}

/** Every filter that narrows the shelf. One matching no book, or every book, is left out. */
export function readingFilterOptions(
  books: ReadonlyArray<RenderableBook>,
): Array<ReadingFilterOption> {
  return READING_FILTER_KEYS.map((key) => {
    const { label, matches, tiltDeg } = READING_FILTERS[key];
    return {
      count: books.filter(matches).length,
      key,
      label,
      tiltDeg,
    };
  }).filter(({ count, key }) => key === 'all' || (count > 0 && count < books.length));
}

/** Books in progress first, then newest finished. */
export function sortBooks(books: ReadonlyArray<RenderableBook>): Array<RenderableBook> {
  return [...books].sort(
    (a, b) =>
      Number(b.readingStatus === 'reading') - Number(a.readingStatus === 'reading') ||
      (b.readDateFinished ?? '').localeCompare(a.readDateFinished ?? ''),
  );
}

export type FeaturedBook = {
  book: RenderableBook;
  tag: 'Currently reading' | 'Latest review';
};

/** Expects `sortBooks` order, so the first match is the newest. */
export function featuredBook(books: ReadonlyArray<RenderableBook>): FeaturedBook | null {
  const reading = books.find((book) => book.readingStatus === 'reading');
  if (reading) {
    return { book: reading, tag: 'Currently reading' };
  }
  const reviewed = books.find((book) => book.review !== null);
  return reviewed ? { book: reviewed, tag: 'Latest review' } : null;
}

/** A five-star review gets a full-width card, any other review a half-width card, and a bare rating a small cover print. */
export type BookCardKind = 'feature' | 'review' | 'cover';

export function bookCardKind(book: RenderableBook): BookCardKind {
  if (book.review === null) {
    return 'cover';
  }
  return book.rating === 5 ? 'feature' : 'review';
}

export function shelfStats(books: ReadonlyArray<RenderableBook>): {
  fiveStars: number;
  total: number;
} {
  return {
    fiveStars: books.filter(READING_FILTERS.fiveStars.matches).length,
    total: books.length,
  };
}

export function extractBookYear(book: RenderableBook): string {
  return book.readDateFinished?.match(/^(\d{4})/)?.[1] ?? 'Earlier';
}

type ShelfSection = {
  books: Array<RenderableBook>;
  label: string;
};

/** Expects `sortBooks` order, so each section's books are already contiguous. */
export function shelfSections(books: ReadonlyArray<RenderableBook>): Array<ShelfSection> {
  const sections: Array<ShelfSection> = [];
  for (const book of books) {
    const label = book.readingStatus === 'reading' ? 'Currently reading' : extractBookYear(book);
    const last = sections.at(-1);
    if (last?.label === label) {
      last.books.push(book);
    } else {
      sections.push({ books: [book], label });
    }
  }
  return sections;
}
