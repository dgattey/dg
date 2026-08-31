import type { CutOutShape } from './cutOutShapes';
import type { PaperTone } from './types';

export type CutOutColor = PaperTone | 'star';

export type CutOutPlacement = {
  color: CutOutColor;
  id: string;
  mirrored?: true;
  rotationDeg: number;
  shape: CutOutShape;
  sizePx: number;
  underprint?: {
    color: CutOutColor;
    offset: readonly [x: number, y: number];
  };
  visibility: 'all' | 'desktop' | 'dark-desktop';
  xPercent: number;
  yPercent: number;
  zIndex: 0 | 1 | 3;
};

export const CUT_OUT_PLACEMENTS = {
  coda: [
    {
      id: 'coda-monstera', shape: 'monstera', color: 'olive', sizePx: 460,
      rotationDeg: 14, xPercent: 4, yPercent: -20, visibility: 'all', zIndex: 0,
    },
    {
      id: 'coda-banana', shape: 'banana', color: 'viridian', sizePx: 380,
      rotationDeg: -30, xPercent: 30, yPercent: 8, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'coda-bird', shape: 'birdpara', color: 'vermilion', sizePx: 260,
      rotationDeg: -10, xPercent: 44, yPercent: 34, visibility: 'all', zIndex: 1, underprint: { color: 'ultramarine', offset: [6, 7] },
    },
    {
      id: 'coda-sun', shape: 'sun', color: 'ochre', sizePx: 180,
      rotationDeg: 0, xPercent: 18, yPercent: 44, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'coda-star-upper', shape: 'star5', color: 'star', sizePx: 46,
      rotationDeg: 8, xPercent: 58, yPercent: 8, visibility: 'desktop', zIndex: 3,
    },
    {
      id: 'coda-heart', shape: 'heart', color: 'rose', sizePx: 90,
      rotationDeg: -12, xPercent: 90, yPercent: 70, visibility: 'all', zIndex: 3,
    },
    {
      id: 'coda-star-lower', shape: 'star5', color: 'cream', sizePx: 40,
      rotationDeg: 16, xPercent: 24, yPercent: 78, visibility: 'dark-desktop', zIndex: 3,
    },
    {
      id: 'coda-star-right', shape: 'star4', color: 'cream', sizePx: 34,
      rotationDeg: -6, xPercent: 78, yPercent: 22, visibility: 'dark-desktop', zIndex: 3,
    },
    {
      id: 'coda-philo', shape: 'philo', color: 'leaf', sizePx: 250,
      rotationDeg: -18, xPercent: 4, yPercent: 64, visibility: 'desktop', zIndex: 1,
    },
],
  devConsole: [
    {
      id: 'dev-console-star', shape: 'star5', color: 'star', sizePx: 44,
      rotationDeg: 12, xPercent: 58, yPercent: 4, visibility: 'desktop', zIndex: 3,
    },
    {
      id: 'dev-console-algae-upper', shape: 'algae', color: 'leaf', sizePx: 170,
      rotationDeg: -20, xPercent: 88, yPercent: 0, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'dev-console-algae-lower', shape: 'algae', color: 'leaf', sizePx: 220,
      rotationDeg: 16, xPercent: 68, yPercent: 82, visibility: 'desktop', zIndex: 1,
    },
],
  error: [
    {
      id: 'error-monstera', shape: 'monstera', color: 'viridian', sizePx: 520,
      rotationDeg: 22, xPercent: 66, yPercent: -12, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'error-fern', shape: 'fern', color: 'olive', sizePx: 340,
      rotationDeg: -34, xPercent: -10, yPercent: 40, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'error-seaweed', shape: 'seaweed2', color: 'olive', sizePx: 240,
      rotationDeg: -16, xPercent: 56, yPercent: 64, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'error-star', shape: 'star5', color: 'star', sizePx: 46,
      rotationDeg: 10, xPercent: 36, yPercent: 6, visibility: 'desktop', zIndex: 3,
    },
],
  helloSheet: [
    {
      id: 'hello-seaweed-left', shape: 'seaweed', color: 'ultramarine', sizePx: 250,
      rotationDeg: -12, xPercent: -4, yPercent: 20, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'hello-fern-left', shape: 'fern', color: 'olive', sizePx: 330,
      rotationDeg: 22, xPercent: -7, yPercent: 42, visibility: 'all', zIndex: 1,
    },
    {
      id: 'hello-seaweed-lower-left', shape: 'seaweed2', color: 'rose', sizePx: 180,
      rotationDeg: -8, xPercent: -2, yPercent: 78, visibility: 'all', zIndex: 1,
    },
    {
      id: 'hello-pods', shape: 'pods', color: 'ochre', sizePx: 210,
      rotationDeg: -18, xPercent: 33, yPercent: 74, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'hello-star-upper', shape: 'star5', color: 'star', sizePx: 40,
      rotationDeg: 12, xPercent: 44, yPercent: 10, visibility: 'desktop', zIndex: 3,
    },
    {
      id: 'hello-star-middle', shape: 'star4', color: 'star', sizePx: 30,
      rotationDeg: -8, xPercent: 47, yPercent: 50, visibility: 'desktop', zIndex: 3,
    },
    {
      id: 'hello-algae', shape: 'algae', color: 'rose', sizePx: 210,
      rotationDeg: 16, xPercent: 39, yPercent: -5, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'hello-moon', shape: 'moon', color: 'cream', sizePx: 64,
      rotationDeg: 14, xPercent: 46, yPercent: -2, visibility: 'dark-desktop', zIndex: 3,
    },
    {
      id: 'hello-coral', shape: 'coral', color: 'ultramarine', sizePx: 170,
      rotationDeg: -10, xPercent: 49, yPercent: 47, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'hello-seaweed-lower-middle', shape: 'seaweed2', color: 'ultramarine', sizePx: 200,
      rotationDeg: 14, xPercent: 53, yPercent: 72, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'hello-fern-right', shape: 'fern', color: 'leaf', sizePx: 320,
      rotationDeg: -28, xPercent: 69, yPercent: 78, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'hello-bird', shape: 'birdpara', color: 'vermilion', sizePx: 300,
      rotationDeg: 8, xPercent: 60, yPercent: 64, visibility: 'all', zIndex: 1, underprint: { color: 'ultramarine', offset: [6, 7] },
    },
    {
      id: 'hello-banana', shape: 'banana', color: 'viridian', sizePx: 440,
      rotationDeg: -24, xPercent: 86, yPercent: 26, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'hello-star-right', shape: 'star4', color: 'ochre', sizePx: 44,
      rotationDeg: 10, xPercent: 92, yPercent: 40, visibility: 'desktop', zIndex: 3,
    },
],
  moreWork: [
    {
      id: 'more-monstera', shape: 'monstera', color: 'viridian', sizePx: 640,
      rotationDeg: 150, xPercent: 72, yPercent: -12, visibility: 'all', zIndex: 0,
    },
    {
      id: 'more-gerbe', shape: 'gerbe', color: 'vermilion', sizePx: 380,
      rotationDeg: 24, xPercent: 38, yPercent: -16, visibility: 'all', zIndex: 0,
    },
    {
      id: 'more-star-upper', shape: 'star5', color: 'star', sizePx: 44,
      rotationDeg: -12, xPercent: 48, yPercent: 4, visibility: 'desktop', zIndex: 3,
    },
    {
      id: 'more-pods', shape: 'pods', color: 'ultramarine', sizePx: 230,
      rotationDeg: 22, xPercent: 27, yPercent: 36, visibility: 'all', zIndex: 1,
    },
    {
      id: 'more-trefoil', shape: 'trefoil', color: 'rose', sizePx: 150,
      rotationDeg: -16, xPercent: 45, yPercent: 44, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'more-algae', shape: 'algae', color: 'leaf', sizePx: 200,
      rotationDeg: 10, xPercent: 36, yPercent: 52, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'more-banana', shape: 'banana', color: 'leaf', sizePx: 440,
      rotationDeg: 40, xPercent: 80, yPercent: 52, visibility: 'desktop', zIndex: 0,
    },
    {
      id: 'more-star-lower', shape: 'star4', color: 'ultramarine', sizePx: 40,
      rotationDeg: 10, xPercent: 6, yPercent: 92, visibility: 'all', zIndex: 3,
    },
    {
      id: 'more-seaweed', shape: 'seaweed', color: 'cream', sizePx: 240,
      rotationDeg: -10, xPercent: -3, yPercent: 40, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'more-philo', shape: 'philo', color: 'viridian', sizePx: 300,
      rotationDeg: -30, xPercent: -6, yPercent: 8, visibility: 'all', zIndex: 1,
    },
    {
      id: 'more-star-middle', shape: 'star5', color: 'cream', sizePx: 40,
      rotationDeg: 20, xPercent: 31, yPercent: 54, visibility: 'desktop', zIndex: 1,
    },
],
  portrait: [
    {
      id: 'portrait-monstera', shape: 'monstera', color: 'viridian', sizePx: 1020,
      rotationDeg: -34, xPercent: -70, yPercent: -62, visibility: 'all', zIndex: 0,
    },
    {
      id: 'portrait-philo', shape: 'philo', color: 'olive', sizePx: 380,
      rotationDeg: 28, xPercent: 58, yPercent: 62, visibility: 'desktop', zIndex: 0,
    },
],
  workSheet: [
    {
      id: 'work-algae', shape: 'algae', color: 'cream', sizePx: 330,
      rotationDeg: -8, xPercent: -4, yPercent: 2, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-star-upper', shape: 'star5', color: 'cream', sizePx: 54,
      rotationDeg: 14, xPercent: 21, yPercent: 3, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-swallow-upper', shape: 'swallow', color: 'cream', sizePx: 170,
      rotationDeg: -6, xPercent: 55, yPercent: -2, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-star-right', shape: 'star4', color: 'cream', sizePx: 44,
      rotationDeg: 0, xPercent: 81, yPercent: 5, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'work-seaweed', shape: 'seaweed', color: 'cream', sizePx: 300,
      rotationDeg: 10, xPercent: 90, yPercent: 26, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-coral', shape: 'coral', color: 'cream', sizePx: 250,
      rotationDeg: -12, xPercent: 27, yPercent: 50, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-star-lower-left', shape: 'star5', color: 'cream', sizePx: 40,
      rotationDeg: -20, xPercent: 3, yPercent: 84, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-trefoil', shape: 'trefoil', color: 'cream', sizePx: 140,
      rotationDeg: 24, xPercent: 4, yPercent: 50, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'work-swallow-lower', shape: 'swallow', color: 'cream', sizePx: 130,
      rotationDeg: 12, xPercent: 74, yPercent: 84, visibility: 'desktop', zIndex: 1, mirrored: true,
    },
    {
      id: 'work-star-bottom', shape: 'star4', color: 'cream', sizePx: 36,
      rotationDeg: 12, xPercent: 48, yPercent: 92, visibility: 'all', zIndex: 1,
    },
    {
      id: 'work-star-middle', shape: 'star5', color: 'cream', sizePx: 34,
      rotationDeg: 30, xPercent: 66, yPercent: 40, visibility: 'desktop', zIndex: 1,
    },
    {
      id: 'work-seaweed2', shape: 'seaweed2', color: 'cream', sizePx: 220,
      rotationDeg: -14, xPercent: 88, yPercent: 70, visibility: 'desktop', zIndex: 1,
    },
],
} satisfies Record<
  'helloSheet' | 'portrait' | 'workSheet' | 'moreWork' | 'coda' | 'devConsole' | 'error',
  ReadonlyArray<CutOutPlacement>
>;

const MORE_WORK_OVERFLOW_SOURCE_IDS = new Set<string>([
  'more-banana',
  'more-pods',
  'more-star-upper',
  'more-star-lower',
]);

export function moreWorkOverflowPlacements(unitKey: string): Array<CutOutPlacement> {
  return CUT_OUT_PLACEMENTS.moreWork
    .filter((placement) => MORE_WORK_OVERFLOW_SOURCE_IDS.has(placement.id))
    .map((placement) => ({
      ...placement,
      id: `${unitKey}-${placement.id}`,
    }));
}

export const ALL_CUT_OUT_PLACEMENTS: ReadonlyArray<CutOutPlacement> = [
  ...CUT_OUT_PLACEMENTS.helloSheet,
  ...CUT_OUT_PLACEMENTS.portrait,
  ...CUT_OUT_PLACEMENTS.workSheet,
  ...CUT_OUT_PLACEMENTS.moreWork,
  ...CUT_OUT_PLACEMENTS.coda,
  ...CUT_OUT_PLACEMENTS.devConsole,
  ...CUT_OUT_PLACEMENTS.error,
];
