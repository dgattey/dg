import { invariant } from '@dg/shared-core/assertions/invariant';
import type { PaperTone } from './types';

export type CollageCardTreatment = {
  offsetPx: number;
  tiltDeg: number;
  tone: PaperTone;
};

const TONES = [
  'ultramarine',
  'rose',
  'vermilion',
  'cream',
  'olive',
  'leaf',
  'viridian',
  'ochre',
] as const satisfies ReadonlyArray<PaperTone>;

const LAYOUTS = [
  { offsetPx: 0, tiltDeg: -2 },
  { offsetPx: 10, tiltDeg: 1.5 },
  { offsetPx: 0, tiltDeg: -1 },
  { offsetPx: 14, tiltDeg: 2.4 },
  { offsetPx: 0, tiltDeg: -1.6 },
  { offsetPx: 8, tiltDeg: 1 },
] as const satisfies ReadonlyArray<Omit<CollageCardTreatment, 'tone'>>;

/** Tone and tilt for the nth card in a collage grid, shared by album and book grids. */
export function collageCardTreatment(index: number): CollageCardTreatment {
  const tone = TONES[index % TONES.length];
  const layout = LAYOUTS[index % LAYOUTS.length];
  invariant(tone && layout, 'Collage card treatment registries must not be empty');
  return { ...layout, tone };
}
