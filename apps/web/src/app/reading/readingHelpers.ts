import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { invariant } from '@dg/shared-core/assertions/invariant';
import type { PaperEdge, PaperTone } from '../collage/types';

export const READING_FILTER_OPTIONS = [
  { key: 'newest', label: 'Newest first', tiltDeg: -1.8 },
  { key: 'fiveStars', label: 'Five stars', tiltDeg: 1.5 },
  { key: 'withNotes', label: 'With notes', tiltDeg: -1.2 },
  { key: 'author', label: 'By author', tiltDeg: 1.8 },
] as const;

export type ReadingFilterKey = (typeof READING_FILTER_OPTIONS)[number]['key'];

export type YearBadgeStyle = {
  edge: PaperEdge;
  tiltDeg: number;
  tone: PaperTone;
};

const YEAR_BADGE_MAP: Record<string, YearBadgeStyle> = {
  '2023': { edge: 'quad-b', tiltDeg: 2.5, tone: 'cerulean' },
  '2024': { edge: 'quad-d', tiltDeg: -2, tone: 'rose' },
  '2025': { edge: 'quad-a', tiltDeg: 2, tone: 'viridian' },
  '2026': { edge: 'quad-c', tiltDeg: -2.5, tone: 'ochre' },
};

const FALLBACK_YEAR_BADGES: ReadonlyArray<YearBadgeStyle> = [
  { edge: 'quad-c', tiltDeg: -2.5, tone: 'ochre' },
  { edge: 'quad-a', tiltDeg: 2, tone: 'viridian' },
  { edge: 'quad-d', tiltDeg: -2, tone: 'rose' },
  { edge: 'quad-b', tiltDeg: 2.5, tone: 'cerulean' },
];

export function yearBadgeStyle(year: string, index = 0): YearBadgeStyle {
  const mapped = YEAR_BADGE_MAP[year];
  if (mapped) {
    return mapped;
  }
  const fallback = FALLBACK_YEAR_BADGES[index % FALLBACK_YEAR_BADGES.length];
  invariant(fallback, 'Fallback year badge registry must not be empty');
  return fallback;
}

const STREAM_CARD_EDGES: ReadonlyArray<PaperEdge> = ['quad-a', 'quad-b', 'quad-c', 'quad-d'];
const STREAM_CARD_TILTS: ReadonlyArray<number> = [0.5, -0.6, -0.4, 0.6];
const STREAM_COVER_TILTS: ReadonlyArray<number> = [-1.5, 1.2, 1.4, -1.2];
const FIVE_STAR_TONES: ReadonlyArray<PaperTone> = ['ochre', 'leaf'];

export type StreamCardTreatment = {
  coverTiltDeg: number;
  edge: PaperEdge;
  isKraft: boolean;
  onDarkSurface: boolean;
  tiltDeg: number;
  tone: PaperTone;
};

export function streamCardTreatment(book: RenderableBook, index: number): StreamCardTreatment {
  const edge = STREAM_CARD_EDGES[index % STREAM_CARD_EDGES.length];
  const tiltDeg = STREAM_CARD_TILTS[index % STREAM_CARD_TILTS.length];
  const coverTiltDeg = STREAM_COVER_TILTS[index % STREAM_COVER_TILTS.length];
  invariant(
    edge && tiltDeg !== undefined && coverTiltDeg !== undefined,
    'Stream card treatment registries must not be empty',
  );

  if (book.rating === 5) {
    const tone = FIVE_STAR_TONES[index % FIVE_STAR_TONES.length] ?? 'ochre';
    return {
      coverTiltDeg,
      edge,
      isKraft: false,
      onDarkSurface: tone === 'leaf',
      tiltDeg,
      tone,
    };
  }

  return {
    coverTiltDeg,
    edge,
    isKraft: index % 2 === 1,
    onDarkSurface: false,
    tiltDeg,
    tone: 'cream',
  };
}

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
    case 'fiveStars':
      return base.filter((book) => book.rating === 5);
    case 'withNotes':
      return base.filter((book) => Boolean(book.review?.trim()));
    case 'author':
      return [...base].sort(
        (a, b) => a.author.localeCompare(b.author) || a.title.localeCompare(b.title),
      );
    default:
      return base;
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
