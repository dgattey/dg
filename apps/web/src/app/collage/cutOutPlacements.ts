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
  zIndex: 0 | 1;
};

export type PlacementRow = readonly [
  id: string,
  shape: CutOutShape,
  color: CutOutColor,
  sizePx: number,
  rotationDeg: number,
  xPercent: number,
  yPercent: number,
  visibility: CutOutVisibility,
  zIndex: 0 | 1,
  options?: {
    mirrored?: true;
    underprint?: readonly [color: CutOutColor, x: number, y: number];
  },
];

export function definePlacements(rows: ReadonlyArray<PlacementRow>): Array<CutOutPlacement> {
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
  coda: definePlacements([
    ['coda-monstera', 'monstera', 'olive', 460, 3.5, 4, -20, 'all', 0],
    ['coda-banana', 'banana', 'viridian', 380, -4, 28, 6, 'desktop', 0],
    [
      'coda-bird',
      'birdpara',
      'vermilion',
      260,
      -2.5,
      46,
      36,
      'all',
      1,
      { underprint: ['ultramarine', 6, 7] },
    ],
    ['coda-sun', 'sun', 'ochre', 180, 0, 18, 44, 'desktop', 0],
    ['coda-star-upper', 'star5', 'star', 46, 2, 60, 10, 'desktop', 1],
    ['coda-heart', 'heart', 'rose', 90, -3, 90, 70, 'all', 1],
    ['coda-star-lower', 'star5', 'cream', 40, 4, 24, 78, 'dark-desktop', 1],
    ['coda-star-right', 'star4', 'cream', 34, -2, 78, 22, 'dark-desktop', 1],
    ['coda-philo', 'philo', 'leaf', 250, -4, 4, 66, 'desktop', 1],
  ]),
  helloSheet: definePlacements([
    ['hello-seaweed-left', 'seaweed', 'ultramarine', 250, -3, -4, 16, 'desktop', 1],
    ['hello-fern-left', 'fern', 'olive', 330, 4, -7, 46, 'all', 1],
    ['hello-seaweed-lower-left', 'seaweed2', 'rose', 180, -2, -1, 80, 'all', 1],
    ['hello-pods', 'pods', 'ochre', 210, -4, 30, 74, 'desktop', 1],
    ['hello-star-upper', 'star5', 'star', 40, 3, 47, 12, 'desktop', 1],
    ['hello-algae', 'algae', 'rose', 210, 4, 38, -6, 'desktop', 1],
    ['hello-moon', 'moon', 'cream', 64, 3.5, 51, -2, 'dark-desktop', 1],
    ['hello-coral', 'coral', 'ultramarine', 170, -2.5, 48, 46, 'desktop', 1],
    ['hello-seaweed-lower-middle', 'seaweed2', 'ultramarine', 200, 3.5, 52, 74, 'desktop', 1],
    ['hello-fern-right', 'fern', 'leaf', 320, -4, 70, 78, 'desktop', 0],
    [
      'hello-bird',
      'birdpara',
      'vermilion',
      300,
      2,
      60,
      64,
      'all',
      1,
      { underprint: ['ultramarine', 6, 7] },
    ],
    ['hello-banana', 'banana', 'viridian', 440, -4, 86, 24, 'desktop', 0],
    ['hello-star-right', 'star4', 'ochre', 44, 2.5, 92, 42, 'desktop', 1],
  ]),
  moreWork: definePlacements([
    ['more-monstera', 'monstera', 'viridian', 640, 4, 72, -12, 'all', 0],
    ['more-gerbe', 'gerbe', 'vermilion', 380, 4, 36, -16, 'all', 0],
    ['more-star-upper', 'star5', 'star', 44, -3, 50, 4, 'desktop', 1],
    ['more-pods', 'pods', 'ultramarine', 230, 4, 25, 34, 'all', 1],
    ['more-trefoil', 'trefoil', 'rose', 150, -4, 48, 42, 'desktop', 1],
    ['more-algae', 'algae', 'leaf', 200, 2.5, 36, 56, 'desktop', 1],
    ['more-banana', 'banana', 'leaf', 440, 4, 80, 52, 'desktop', 0],
    ['more-star-lower', 'star4', 'ultramarine', 40, 2.5, 6, 92, 'all', 1],
    ['more-seaweed', 'seaweed', 'cream', 240, -2.5, -3, 42, 'desktop', 1],
    ['more-philo', 'philo', 'viridian', 300, -4, -6, 8, 'all', 1],
    ['more-star-middle', 'star5', 'cream', 40, 4, 28, 62, 'desktop', 1],
  ]),
  portrait: definePlacements([
    ['portrait-monstera', 'monstera', 'viridian', 1020, -4, -70, -62, 'all', 0],
    ['portrait-philo', 'philo', 'olive', 380, 4, 58, 62, 'desktop', 0],
  ]),
  workSheet: definePlacements([
    ['work-algae', 'algae', 'cream', 330, -2, -4, 2, 'all', 1],
    ['work-star-upper', 'star5', 'cream', 54, 3.5, 22, 4, 'all', 1],
    ['work-swallow-upper', 'swallow', 'cream', 170, -1.5, 54, -2, 'all', 1],
    ['work-star-right', 'star4', 'cream', 44, 0, 72, 4, 'desktop', 1],
    ['work-seaweed', 'seaweed', 'cream', 300, 2.5, 90, 26, 'all', 1],
    ['work-coral', 'coral', 'cream', 250, -3, 28, 48, 'all', 1],
    ['work-star-lower-left', 'star5', 'cream', 40, -4, 3, 84, 'all', 1],
    ['work-trefoil', 'trefoil', 'cream', 140, 4, 4, 50, 'desktop', 1],
    [
      'work-swallow-lower',
      'swallow',
      'cream',
      130,
      3,
      74,
      84,
      'desktop',
      1,
      { mirrored: true },
    ],
    ['work-star-bottom', 'star4', 'cream', 36, 3, 48, 92, 'all', 1],
    ['work-seaweed2', 'seaweed2', 'cream', 220, -3.5, 88, 70, 'desktop', 1],
  ]),
} satisfies Record<
  'helloSheet' | 'portrait' | 'workSheet' | 'moreWork' | 'coda',
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
    .map((placement) => ({ ...placement, id: `${unitKey}-${placement.id}` }));
}

export const ALL_CUT_OUT_PLACEMENTS = Object.values(CUT_OUT_PLACEMENTS).flat();
