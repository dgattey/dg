import type { CutOutShape } from './cutOutShapes';
import type { PaperTone } from './types';

export type CutOutColor = PaperTone | 'star';

export type CutOutPlacement = {
  color: CutOutColor;
  id: string;
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
  helloSheet: [
    {
      color: 'ultramarine',
      id: 'hello-seaweed-left',
      rotationDeg: -12,
      shape: 'seaweed',
      sizePx: 250,
      visibility: 'desktop',
      xPercent: -4,
      yPercent: 20,
      zIndex: 1,
    },
    {
      color: 'olive',
      id: 'hello-fern-left',
      rotationDeg: 22,
      shape: 'fern',
      sizePx: 330,
      visibility: 'all',
      xPercent: -7,
      yPercent: 42,
      zIndex: 1,
    },
    {
      color: 'rose',
      id: 'hello-seaweed-lower-left',
      rotationDeg: -8,
      shape: 'seaweed2',
      sizePx: 180,
      visibility: 'all',
      xPercent: -2,
      yPercent: 78,
      zIndex: 1,
    },
    {
      color: 'ochre',
      id: 'hello-pods',
      rotationDeg: -18,
      shape: 'pods',
      sizePx: 210,
      visibility: 'desktop',
      xPercent: 33,
      yPercent: 74,
      zIndex: 1,
    },
    {
      color: 'star',
      id: 'hello-star-upper',
      rotationDeg: 12,
      shape: 'star5',
      sizePx: 40,
      visibility: 'desktop',
      xPercent: 44,
      yPercent: 10,
      zIndex: 3,
    },
    {
      color: 'star',
      id: 'hello-star-middle',
      rotationDeg: -8,
      shape: 'star4',
      sizePx: 30,
      visibility: 'desktop',
      xPercent: 47,
      yPercent: 50,
      zIndex: 3,
    },
    {
      color: 'rose',
      id: 'hello-algae',
      rotationDeg: 16,
      shape: 'algae',
      sizePx: 210,
      visibility: 'desktop',
      xPercent: 39,
      yPercent: -5,
      zIndex: 1,
    },
    {
      color: 'cream',
      id: 'hello-moon',
      rotationDeg: 14,
      shape: 'moon',
      sizePx: 64,
      visibility: 'dark-desktop',
      xPercent: 46,
      yPercent: -2,
      zIndex: 3,
    },
    {
      color: 'ultramarine',
      id: 'hello-coral',
      rotationDeg: -10,
      shape: 'coral',
      sizePx: 170,
      visibility: 'desktop',
      xPercent: 49,
      yPercent: 47,
      zIndex: 1,
    },
    {
      color: 'ultramarine',
      id: 'hello-seaweed-lower-middle',
      rotationDeg: 14,
      shape: 'seaweed2',
      sizePx: 200,
      visibility: 'desktop',
      xPercent: 53,
      yPercent: 72,
      zIndex: 1,
    },
    {
      color: 'leaf',
      id: 'hello-fern-right',
      rotationDeg: -28,
      shape: 'fern',
      sizePx: 320,
      visibility: 'desktop',
      xPercent: 69,
      yPercent: 78,
      zIndex: 0,
    },
    {
      color: 'vermilion',
      id: 'hello-bird',
      rotationDeg: 8,
      shape: 'birdpara',
      sizePx: 300,
      underprint: {
        color: 'ultramarine',
        offset: [6, 7],
      },
      visibility: 'all',
      xPercent: 60,
      yPercent: 64,
      zIndex: 1,
    },
    {
      color: 'viridian',
      id: 'hello-banana',
      rotationDeg: -24,
      shape: 'banana',
      sizePx: 440,
      visibility: 'desktop',
      xPercent: 86,
      yPercent: 26,
      zIndex: 0,
    },
    {
      color: 'ochre',
      id: 'hello-star-right',
      rotationDeg: 10,
      shape: 'star4',
      sizePx: 44,
      visibility: 'desktop',
      xPercent: 92,
      yPercent: 40,
      zIndex: 3,
    },
  ],
  portrait: [
    {
      color: 'viridian',
      id: 'portrait-monstera',
      rotationDeg: -34,
      shape: 'monstera',
      sizePx: 1020,
      visibility: 'all',
      xPercent: -70,
      yPercent: -62,
      zIndex: 0,
    },
    {
      color: 'olive',
      id: 'portrait-philo',
      rotationDeg: 28,
      shape: 'philo',
      sizePx: 380,
      visibility: 'desktop',
      xPercent: 58,
      yPercent: 62,
      zIndex: 0,
    },
  ],
} satisfies Record<'helloSheet' | 'portrait', ReadonlyArray<CutOutPlacement>>;

export const ALL_CUT_OUT_PLACEMENTS: ReadonlyArray<CutOutPlacement> = [
  ...CUT_OUT_PLACEMENTS.helloSheet,
  ...CUT_OUT_PLACEMENTS.portrait,
];
