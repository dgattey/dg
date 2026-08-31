import type { CutOutShape } from './cutOutShapes';
import type { PaperTone } from './types';

export type CutOutColor = PaperTone | 'star';
type CutOutVisibility = 'all' | 'desktop' | 'dark-desktop';

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
  visibility: CutOutVisibility;
  xPercent: number;
  yPercent: number;
  zIndex: 0 | 1 | 3;
};

type PlacementRow = readonly [
  id: string,
  shape: CutOutShape,
  color: CutOutColor,
  sizePx: number,
  rotationDeg: number,
  xPercent: number,
  yPercent: number,
  visibility: CutOutVisibility,
  zIndex: 0 | 1 | 3,
  options?: {
    mirrored?: true;
    underprint?: readonly [color: CutOutColor, x: number, y: number];
  },
];

function definePlacements(rows: ReadonlyArray<PlacementRow>): Array<CutOutPlacement> {
  return rows.map(
    ([id, shape, color, sizePx, rotationDeg, xPercent, yPercent, visibility, zIndex, options]) => {
      const underprint = options?.underprint;
      return {
        color,
        id,
        ...(options?.mirrored ? { mirrored: true } : {}),
        rotationDeg,
        shape,
        sizePx,
        ...(underprint
          ? { underprint: { color: underprint[0], offset: [underprint[1], underprint[2]] } }
          : {}),
        visibility,
        xPercent,
        yPercent,
        zIndex,
      };
    },
  );
}

export const CUT_OUT_PLACEMENTS = {
  helloSheet: definePlacements([
    ['hello-seaweed-left', 'seaweed', 'ultramarine', 250, -12, -4, 20, 'desktop', 1],
    ['hello-fern-left', 'fern', 'olive', 330, 22, -7, 42, 'all', 1],
    ['hello-seaweed-lower-left', 'seaweed2', 'rose', 180, -8, -2, 78, 'all', 1],
    ['hello-pods', 'pods', 'ochre', 210, -18, 33, 74, 'desktop', 1],
    ['hello-star-upper', 'star5', 'star', 40, 12, 44, 10, 'desktop', 3],
    ['hello-star-middle', 'star4', 'star', 30, -8, 47, 50, 'desktop', 3],
    ['hello-algae', 'algae', 'rose', 210, 16, 39, -5, 'desktop', 1],
    ['hello-moon', 'moon', 'cream', 64, 14, 46, -2, 'dark-desktop', 3],
    ['hello-coral', 'coral', 'ultramarine', 170, -10, 49, 47, 'desktop', 1],
    ['hello-seaweed-lower-middle', 'seaweed2', 'ultramarine', 200, 14, 53, 72, 'desktop', 1],
    ['hello-fern-right', 'fern', 'leaf', 320, -28, 69, 78, 'desktop', 0],
    [
      'hello-bird',
      'birdpara',
      'vermilion',
      300,
      8,
      60,
      64,
      'all',
      1,
      { underprint: ['ultramarine', 6, 7] },
    ],
    ['hello-banana', 'banana', 'viridian', 440, -24, 86, 26, 'desktop', 0],
    ['hello-star-right', 'star4', 'ochre', 44, 10, 92, 40, 'desktop', 3],
  ]),
  portrait: definePlacements([
    ['portrait-monstera', 'monstera', 'viridian', 1020, -34, -70, -62, 'all', 0],
    ['portrait-philo', 'philo', 'olive', 380, 28, 58, 62, 'desktop', 0],
  ]),
} satisfies Record<'helloSheet' | 'portrait', ReadonlyArray<CutOutPlacement>>;

export const ALL_CUT_OUT_PLACEMENTS = Object.values(CUT_OUT_PLACEMENTS).flat();
