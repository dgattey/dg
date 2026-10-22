import type { PaperTone } from './types';

/**
 * Day-scheme values of the collage color tokens in `collage.css`, for
 * renderers that can't read CSS variables, like social images and app icons.
 */
export const PAPER_PALETTE = {
  black: '#1d1a15',
  cerulean: '#4f8ec1',
  chartreuse: '#b7c25a',
  cobalt: '#3a60c2',
  cream: '#f7f1e2',
  ink: '#1d1a15',
  leaf: '#3d7b4b',
  ochre: '#dca63b',
  olive: '#7b8a3a',
  paper: '#ede3cb',
  rose: '#d9838f',
  ultramarine: '#2c4db0',
  vermilion: '#d95a36',
  viridian: '#1a5240',
} as const satisfies Record<PaperTone | 'ink' | 'paper', `#${string}`>;

/** Night-scheme `--paper`, the page background behind the dark collage. */
export const NIGHT_PAPER = '#152238';
