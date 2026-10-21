import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';

export const READING_FILTER_OPTIONS = [
  { key: 'all', label: 'All', tiltDeg: -2.2 },
  { key: 'reading', label: 'Currently reading', tiltDeg: 1.8 },
  { key: 'finished', label: 'Finished', tiltDeg: -1.4 },
  { key: 'fiveStars', label: '5 stars', tiltDeg: 2.1 },
  { key: 'withNotes', label: 'With notes', tiltDeg: -1.6 },
] as const;

export type ReadingFilterKey = (typeof READING_FILTER_OPTIONS)[number]['key'];

const MONTH_ABBREVS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatFinishedMonthYear(isoDate: string | null | undefined): string | null {
  if (!isoDate) {
    return null;
  }
  const match = isoDate.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  const monthIdx = Number.parseInt(match[2], 10) - 1;
  const monthName = MONTH_ABBREVS[monthIdx];
  if (!monthName) {
    return match[1];
  }
  if (match[3]) {
    const day = Number.parseInt(match[3], 10);
    if (day > 0) {
      return `${monthName} ${day}, ${match[1]}`;
    }
  }
  return `${monthName} ${match[1]}`;
}

export function extractBookYear(book: RenderableBook): string {
  const match = book.readDateFinished?.match(/^(\d{4})/);
  return match?.[1] ?? 'Earlier';
}

/**
 * Splits a review into an opening pull sentence (up to ~180 chars) and the remaining text.
 */
export function splitReviewIntoPullAndRest(review: string | null | undefined): {
  pullQuote: string | null;
  restText: string | null;
} {
  if (!review) {
    return { pullQuote: null, restText: null };
  }
  const cleaned = review.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return { pullQuote: null, restText: null };
  }
  const sentenceMatch = cleaned.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  if (sentenceMatch?.[1] && sentenceMatch[1].length <= 185) {
    const rest = sentenceMatch[2]?.trim() || null;
    return { pullQuote: sentenceMatch[1].trim(), restText: rest };
  }
  return { pullQuote: cleaned, restText: null };
}

export type YearGroup = {
  averageRating: number | null;
  fiveStarCount: number;
  includesLatest: boolean;
  streamBooks: Array<RenderableBook>;
  totalCount: number;
  year: string;
};

export function filterAndSortBooks(
  books: ReadonlyArray<RenderableBook>,
  filterKey: ReadingFilterKey,
): Array<RenderableBook> {
  const base = [...books].sort((a, b) =>
    (b.readDateFinished ?? '').localeCompare(a.readDateFinished ?? ''),
  );
  switch (filterKey) {
    case 'all':
      return base;
    case 'reading': {
      const readingBooks = base.filter((book) => book.readingStatus === 'reading');
      return readingBooks.length > 0 ? readingBooks : base.slice(0, 1);
    }
    case 'finished':
      return base.filter((book) => book.readingStatus === 'read');
    case 'fiveStars':
      return base.filter((book) => book.rating === 5);
    case 'withNotes':
      return base.filter((book) => Boolean(book.review?.trim()));
    default: {
      const _exhaustive: never = filterKey;
      return _exhaustive;
    }
  }
}

export function buildYearGroups(
  allBooksInOrder: ReadonlyArray<RenderableBook>,
  visibleBooks: ReadonlyArray<RenderableBook>,
  latestBookId: string | null,
): Array<YearGroup> {
  const allByYear = new Map<string, Array<RenderableBook>>();
  for (const book of allBooksInOrder) {
    const year = extractBookYear(book);
    const list = allByYear.get(year) ?? [];
    list.push(book);
    allByYear.set(year, list);
  }

  const streamByYear = new Map<string, Array<RenderableBook>>();
  for (const book of visibleBooks) {
    if (book.id === latestBookId) {
      continue;
    }
    const year = extractBookYear(book);
    const list = streamByYear.get(year) ?? [];
    list.push(book);
    streamByYear.set(year, list);
  }

  const years = [...streamByYear.keys()].sort((a, b) => b.localeCompare(a));
  return years.map((year) => {
    const streamBooks = streamByYear.get(year) ?? [];
    const fullYearBooks = allByYear.get(year) ?? streamBooks;
    const includesLatest =
      latestBookId !== null && fullYearBooks.some((book) => book.id === latestBookId);
    const rated = fullYearBooks.filter(
      (book): book is RenderableBook & { rating: number } => typeof book.rating === 'number',
    );
    const averageRating =
      rated.length > 0 ? rated.reduce((sum, book) => sum + book.rating, 0) / rated.length : null;
    const fiveStarCount = fullYearBooks.filter((book) => book.rating === 5).length;

    return {
      averageRating,
      fiveStarCount,
      includesLatest,
      streamBooks,
      totalCount: fullYearBooks.length,
      year,
    };
  });
}

export function formatRailStarSummary(averageRating: number | null): string | null {
  if (averageRating === null) {
    return null;
  }
  const rounded = Math.max(0, Math.min(5, Math.round(averageRating)));
  const stars = `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
  return `${stars} ${averageRating.toFixed(1)} average`;
}
