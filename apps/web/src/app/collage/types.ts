export const PAPER_TONES = [
  'cream',
  'ultramarine',
  'viridian',
  'leaf',
  'olive',
  'chartreuse',
  'cerulean',
  'cobalt',
  'vermilion',
  'ochre',
  'rose',
  'black',
] as const;

export type PaperTone = (typeof PAPER_TONES)[number];

export const PAPER_EDGES = [
  'quad-a',
  'quad-b',
  'quad-c',
  'quad-d',
  'torn-a',
  'torn-b',
  'torn-c',
] as const;

export type PaperEdge = (typeof PAPER_EDGES)[number];

export const PAPER_INK_TONES = {
  cerulean: true,
  chartreuse: true,
  cream: true,
  ochre: true,
  olive: true,
  rose: true,
  vermilion: true,
} as const satisfies Partial<Record<PaperTone, true>>;
