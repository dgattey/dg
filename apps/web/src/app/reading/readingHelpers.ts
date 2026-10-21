import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { invariant } from '@dg/shared-core/assertions/invariant';
import type { CutOutShape } from '../collage/cutOutShapes';
import type { PaperEdge, PaperTone } from '../collage/types';

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
  const match = isoDate?.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  const monthName = MONTH_ABBREVS[Number.parseInt(match[2], 10) - 1];
  if (!monthName) {
    return match[1];
  }
  const day = match[3] ? Number.parseInt(match[3], 10) : 0;
  return day > 0 ? `${monthName} ${day}, ${match[1]}` : `${monthName} ${match[1]}`;
}

export function extractBookYear(book: RenderableBook): string {
  return book.readDateFinished?.match(/^(\d{4})/)?.[1] ?? 'Earlier';
}

export function splitReviewIntoPullAndRest(review: string | null | undefined): {
  pullQuote: string | null;
  restText: string | null;
} {
  const cleaned = review?.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return { pullQuote: null, restText: null };
  }
  const match = cleaned.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  if (match?.[1] && match[1].length <= 185) {
    return { pullQuote: match[1].trim(), restText: match[2]?.trim() || null };
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
    allByYear.set(year, [...(allByYear.get(year) ?? []), book]);
  }
  const streamByYear = new Map<string, Array<RenderableBook>>();
  for (const book of visibleBooks) {
    if (book.id !== latestBookId) {
      const year = extractBookYear(book);
      streamByYear.set(year, [...(streamByYear.get(year) ?? []), book]);
    }
  }
  return [...streamByYear.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => {
      const streamBooks = streamByYear.get(year) ?? [];
      const fullYearBooks = allByYear.get(year) ?? streamBooks;
      const rated = fullYearBooks.filter(
        (b): b is RenderableBook & { rating: number } => typeof b.rating === 'number',
      );
      return {
        averageRating:
          rated.length > 0 ? rated.reduce((s, b) => s + b.rating, 0) / rated.length : null,
        fiveStarCount: fullYearBooks.filter((b) => b.rating === 5).length,
        includesLatest: latestBookId !== null && fullYearBooks.some((b) => b.id === latestBookId),
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
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)} ${averageRating.toFixed(1)} average`;
}

export type YearBadgeStyle = {
  botanicalColor: PaperTone;
  botanicalRotationDeg: number;
  botanicalShape: CutOutShape;
  edge: PaperEdge;
  secondaryColor: PaperTone;
  secondaryRotationDeg: number;
  secondaryShape: CutOutShape;
  tiltDeg: number;
  tone: PaperTone;
};

const YEAR_BADGE_ROWS: ReadonlyArray<string> = [
  '2026|ochre|quad-c|-6.5|monstera|viridian|20|star5|vermilion|-16',
  '2025|viridian|quad-a|7.5|pods|ochre|-22|star4|rose|19',
  '2024|rose|quad-d|6.5|fern|leaf|16|trefoil|vermilion|-15',
  '2023|cobalt|quad-b|-6|coral|vermilion|-18|star5|ochre|14',
  'Earlier|ultramarine|quad-c|6|philo|olive|15|star5|ochre|-12',
];

const YEAR_BADGES: Record<string, YearBadgeStyle> = Object.fromEntries(
  YEAR_BADGE_ROWS.map((row) => {
    const [year = '', tone, edge, tilt, bShape, bColor, bRot, sShape, sColor, sRot] =
      row.split('|');
    return [
      year,
      {
        botanicalColor: bColor as PaperTone,
        botanicalRotationDeg: Number(bRot),
        botanicalShape: bShape as CutOutShape,
        edge: edge as PaperEdge,
        secondaryColor: sColor as PaperTone,
        secondaryRotationDeg: Number(sRot),
        secondaryShape: sShape as CutOutShape,
        tiltDeg: Number(tilt),
        tone: tone as PaperTone,
      },
    ];
  }),
);

export function yearBadgeStyle(year: string, index = 0): YearBadgeStyle {
  const keys = ['2026', '2025', '2024', '2023'] as const;
  const fallbackKey = keys[index % keys.length] ?? '2026';
  const style = YEAR_BADGES[year] ?? YEAR_BADGES[fallbackKey];
  invariant(style, 'Year badge registry must not be empty');
  return style;
}

const GENRE_RULES: ReadonlyArray<string> = [
  'path made clear:Essays & wisdom|theo of golden:Literary fiction|urban jungle:History & cities|cultish:Language & culture|pachinko:Historical saga|dune:Sci-fi classic|maali almeida:Magical realism|to paradise:Literary fiction|artemis:Lunar sci-fi|birnam wood:Eco-thriller|when we were birds:Mythic fiction|color purple:Modern classic|supernova era:Speculative sci-fi|water for elephants:Historical fiction|stories of eva luna:Short stories|eva luna:Magical realism|poems from gaza:Poetry|white fragility:Sociology|passage to india:Classic fiction|the president:Political satire|hitchhiker:Comic sci-fi|piranesi:Fantasy mystery|americanah:Contemporary classic',
];
const GENRE_PAIRS = (GENRE_RULES[0] ?? '').split('|').map((pair) => pair.split(':'));
const FALLBACK_GENRES = [
  'Literary fiction',
  'Nonfiction',
  'Speculative fiction',
  'Culture & essays',
] as const;

export function inferBookGenre(book: RenderableBook, index = 0): string {
  const lower = book.title.toLowerCase();
  for (const [frag = '', genre = ''] of GENRE_PAIRS) {
    if (frag && lower.includes(frag)) {
      return genre;
    }
  }
  return FALLBACK_GENRES[index % FALLBACK_GENRES.length] ?? 'Shelf note';
}

const STREAM_EDGES: ReadonlyArray<PaperEdge> = [
  'quad-a',
  'quad-b',
  'quad-c',
  'quad-d',
  'soft-a',
  'soft-b',
];
const STREAM_TILTS = [-2.4, 2.1, -1.6, 2.8, -2.8, 1.9, -2.1, 2.5] as const;
const COVER_TILTS = [-2.6, 2.2, 1.8, -2.1, 2.5, -1.7] as const;
const OFFSETS_PX = [0, 10, -4, 14, 2, 12] as const;
const MAT_PCS = [
  'var(--cream)',
  'var(--butter)',
  'color-mix(in oklab, var(--ochre) 24%, var(--cream))',
  'color-mix(in oklab, var(--leaf) 18%, var(--cream))',
  'var(--cream)',
  'color-mix(in oklab, var(--rose) 24%, var(--cream))',
  'var(--butter)',
  'color-mix(in oklab, var(--cerulean) 20%, var(--cream))',
] as const;
const DOG_EAR_VARIANTS = ['butter', 'ochre', 'terracotta'] as const;

export type DogEarPickVariant = (typeof DOG_EAR_VARIANTS)[number];

export type StreamCardTreatment = {
  coverTiltDeg: number;
  dogEarVariant: DogEarPickVariant;
  edge: PaperEdge;
  genreLabel: string;
  isDogEarPick: boolean;
  matPc: string;
  offsetPx: number;
  tiltDeg: number;
};

export function streamCardTreatment(book: RenderableBook, index: number): StreamCardTreatment {
  const edge = STREAM_EDGES[index % STREAM_EDGES.length] ?? 'quad-a';
  const rawTilt = STREAM_TILTS[index % STREAM_TILTS.length] ?? -2;
  const coverTiltDeg = COVER_TILTS[index % COVER_TILTS.length] ?? -2;
  const offsetPx = OFFSETS_PX[index % OFFSETS_PX.length] ?? 0;
  const matPc = MAT_PCS[index % MAT_PCS.length] ?? 'var(--cream)';
  const dogEarVariant = DOG_EAR_VARIANTS[index % DOG_EAR_VARIANTS.length] ?? 'butter';
  const isDogEarPick = book.rating === 5;

  return {
    coverTiltDeg: isDogEarPick ? (index % 2 === 0 ? -3.2 : 2.8) : coverTiltDeg,
    dogEarVariant,
    edge: isDogEarPick ? (index % 2 === 0 ? 'soft-a' : 'soft-b') : edge,
    genreLabel: inferBookGenre(book, index),
    isDogEarPick,
    matPc,
    offsetPx: isDogEarPick ? 0 : offsetPx,
    tiltDeg: isDogEarPick
      ? Number(Math.max(-2.2, Math.min(2.4, rawTilt * 0.78)).toFixed(2))
      : rawTilt,
  };
}
