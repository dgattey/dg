import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { invariant } from '@dg/shared-core/assertions/invariant';
import type { CutOutShape } from '../collage/cutOutShapes';
import type { PaperEdge, PaperTone } from '../collage/types';

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

const YEAR_BADGE_MAP: Record<string, YearBadgeStyle> = {
  '2023': {
    botanicalColor: 'vermilion',
    botanicalRotationDeg: -18,
    botanicalShape: 'coral',
    edge: 'quad-b',
    secondaryColor: 'ochre',
    secondaryRotationDeg: 14,
    secondaryShape: 'star5',
    tiltDeg: -6,
    tone: 'cobalt',
  },
  '2024': {
    botanicalColor: 'leaf',
    botanicalRotationDeg: 16,
    botanicalShape: 'fern',
    edge: 'quad-d',
    secondaryColor: 'vermilion',
    secondaryRotationDeg: -15,
    secondaryShape: 'trefoil',
    tiltDeg: 6.5,
    tone: 'rose',
  },
  '2025': {
    botanicalColor: 'ochre',
    botanicalRotationDeg: -22,
    botanicalShape: 'pods',
    edge: 'quad-a',
    secondaryColor: 'rose',
    secondaryRotationDeg: 19,
    secondaryShape: 'star4',
    tiltDeg: 7.5,
    tone: 'viridian',
  },
  '2026': {
    botanicalColor: 'viridian',
    botanicalRotationDeg: 20,
    botanicalShape: 'monstera',
    edge: 'quad-c',
    secondaryColor: 'vermilion',
    secondaryRotationDeg: -16,
    secondaryShape: 'star5',
    tiltDeg: -6.5,
    tone: 'ochre',
  },
  Earlier: {
    botanicalColor: 'olive',
    botanicalRotationDeg: 15,
    botanicalShape: 'philo',
    edge: 'quad-c',
    secondaryColor: 'ochre',
    secondaryRotationDeg: -12,
    secondaryShape: 'star5',
    tiltDeg: 6,
    tone: 'ultramarine',
  },
};

const FALLBACK_YEAR_BADGES: ReadonlyArray<YearBadgeStyle> = [
  YEAR_BADGE_MAP['2026'] as YearBadgeStyle,
  YEAR_BADGE_MAP['2025'] as YearBadgeStyle,
  YEAR_BADGE_MAP['2024'] as YearBadgeStyle,
  YEAR_BADGE_MAP['2023'] as YearBadgeStyle,
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

const STREAM_CARD_EDGES: ReadonlyArray<PaperEdge> = [
  'quad-a',
  'quad-b',
  'quad-c',
  'quad-d',
  'soft-a',
  'soft-b',
];
const STREAM_CARD_TILTS: ReadonlyArray<number> = [-2.4, 2.1, -1.6, 2.8, -2.8, 1.9, -2.1, 2.5];
const STREAM_COVER_TILTS: ReadonlyArray<number> = [-2.6, 2.2, 1.8, -2.1, 2.5, -1.7];
const STREAM_OFFSETS_PX: ReadonlyArray<number> = [0, 10, -4, 14, 2, 12];

export type MatVariant = 'butter' | 'cerulean' | 'cream' | 'kraft' | 'rose' | 'sage';

const MAT_VARIANTS: ReadonlyArray<MatVariant> = [
  'cream',
  'butter',
  'kraft',
  'sage',
  'cream',
  'rose',
  'butter',
  'cerulean',
];

export type DogEarPickVariant = 'butter' | 'ochre' | 'terracotta';

const DOG_EAR_VARIANTS: ReadonlyArray<DogEarPickVariant> = ['butter', 'ochre', 'terracotta'];

export type StreamCardTreatment = {
  coverTiltDeg: number;
  dogEarVariant: DogEarPickVariant;
  edge: PaperEdge;
  genreLabel: string;
  isDogEarPick: boolean;
  isKraft: boolean;
  matVariant: MatVariant;
  offsetPx: number;
  onDarkSurface: boolean;
  tiltDeg: number;
  tone: PaperTone;
};

const GENRE_BY_TITLE_FRAGMENT: ReadonlyArray<readonly [fragment: string, genre: string]> = [
  ['path made clear', 'Essays & wisdom'],
  ['theo of golden', 'Literary fiction'],
  ['urban jungle', 'History & cities'],
  ['cultish', 'Language & culture'],
  ['pachinko', 'Historical saga'],
  ['dune', 'Sci-fi classic'],
  ['maali almeida', 'Magical realism'],
  ['to paradise', 'Literary fiction'],
  ['artemis', 'Lunar sci-fi'],
  ['birnam wood', 'Eco-thriller'],
  ['when we were birds', 'Mythic fiction'],
  ['color purple', 'Modern classic'],
  ['supernova era', 'Speculative sci-fi'],
  ['water for elephants', 'Historical fiction'],
  ['stories of eva luna', 'Short stories'],
  ['eva luna', 'Magical realism'],
  ['poems from gaza', 'Poetry'],
  ['white fragility', 'Sociology'],
  ['passage to india', 'Classic fiction'],
  ['the president', 'Political satire'],
  ['hitchhiker', 'Comic sci-fi'],
  ['piranesi', 'Fantasy mystery'],
  ['americanah', 'Contemporary classic'],
  ['tomorrow, and tomorrow', 'Literary fiction'],
  ['project hail mary', 'Hard sci-fi'],
  ['klara and the sun', 'Speculative fiction'],
  ['data-intensive', 'Systems & architecture'],
];

const FALLBACK_GENRES: ReadonlyArray<string> = [
  'Literary fiction',
  'Nonfiction',
  'Speculative fiction',
  'Culture & essays',
];

export function inferBookGenre(book: RenderableBook, index = 0): string {
  const lower = book.title.toLowerCase();
  for (const [fragment, genre] of GENRE_BY_TITLE_FRAGMENT) {
    if (lower.includes(fragment)) {
      return genre;
    }
  }
  return FALLBACK_GENRES[index % FALLBACK_GENRES.length] ?? 'Shelf note';
}

export function isStandoutDogEarBook(book: RenderableBook): boolean {
  if (book.rating === 5) {
    return true;
  }
  const lower = book.title.toLowerCase();
  return (
    lower.includes('tomorrow, and tomorrow') ||
    lower.includes('project hail mary') ||
    lower.includes('klara and the sun') ||
    lower.includes('data-intensive')
  );
}

export function streamCardTreatment(book: RenderableBook, index: number): StreamCardTreatment {
  const edge = STREAM_CARD_EDGES[index % STREAM_CARD_EDGES.length];
  const rawTilt = STREAM_CARD_TILTS[index % STREAM_CARD_TILTS.length];
  const coverTiltDeg = STREAM_COVER_TILTS[index % STREAM_COVER_TILTS.length];
  const offsetPx = STREAM_OFFSETS_PX[index % STREAM_OFFSETS_PX.length] ?? 0;
  const matVariant = MAT_VARIANTS[index % MAT_VARIANTS.length] ?? 'cream';
  const dogEarVariant = DOG_EAR_VARIANTS[index % DOG_EAR_VARIANTS.length] ?? 'butter';
  invariant(
    edge && rawTilt !== undefined && coverTiltDeg !== undefined,
    'Stream card treatment registries must not be empty',
  );

  const isDogEarPick = isStandoutDogEarBook(book);
  const genreLabel = inferBookGenre(book, index);

  if (isDogEarPick) {
    const tone: PaperTone =
      dogEarVariant === 'terracotta' ? 'vermilion' : dogEarVariant === 'ochre' ? 'ochre' : 'cream';
    const largeTilt = Math.max(-2.2, Math.min(2.4, rawTilt * 0.78));
    return {
      coverTiltDeg: index % 2 === 0 ? -3.2 : 2.8,
      dogEarVariant,
      edge: index % 2 === 0 ? 'soft-a' : 'soft-b',
      genreLabel,
      isDogEarPick: true,
      isKraft: false,
      matVariant: 'butter',
      offsetPx: 0,
      onDarkSurface: false,
      tiltDeg: Number(largeTilt.toFixed(2)),
      tone,
    };
  }

  return {
    coverTiltDeg,
    dogEarVariant,
    edge,
    genreLabel,
    isDogEarPick: false,
    isKraft: matVariant === 'kraft',
    matVariant,
    offsetPx,
    onDarkSurface: false,
    tiltDeg: rawTilt,
    tone: 'cream',
  };
}
