import type { CutOutColor, CutOutPlacement } from './cutOutPlacements';
import type { CutOutShape } from './cutOutShapes';
import type { PaperTone } from './types';

type SheetPattern = 'dots' | 'gingham' | 'solid' | 'stripes';
type SheetVisibility = 'all' | 'desktop';

type SheetBase = {
  accent?: PaperTone;
  id: string;
  pattern: SheetPattern;
  rotationDeg: number;
  tone: PaperTone;
  visibility: SheetVisibility;
  xPercent: number;
  yPercent: number;
};

export type SheetPlacement =
  | (SheetBase & { edge: 'torn'; heightPx: number; widthPercent: number })
  | (SheetBase & { edge: 'disc' | 'pebble'; sizePx: number });

export type BackdropBand = {
  cutOuts: ReadonlyArray<CutOutPlacement>;
  sheets: ReadonlyArray<SheetPlacement>;
};

export type Backdrop = {
  /** `fill` stretches one band over the whole page instead of stacking fixed bands. */
  bandHeightPx: number | 'fill';
  bands: ReadonlyArray<BackdropBand>;
  repeat: number;
};

type Tones = PaperTone | readonly [tone: PaperTone, accent: PaperTone];

function tones(value: Tones): Pick<SheetBase, 'accent' | 'tone'> {
  return typeof value === 'string' ? { tone: value } : { accent: value[1], tone: value[0] };
}

function torn(
  id: string,
  pattern: SheetPattern,
  value: Tones,
  [xPercent, yPercent, widthPercent, heightPx]: readonly [number, number, number, number],
  rotationDeg: number,
  visibility: SheetVisibility,
): SheetPlacement {
  return {
    ...tones(value),
    edge: 'torn',
    heightPx,
    id,
    pattern,
    rotationDeg,
    visibility,
    widthPercent,
    xPercent,
    yPercent,
  };
}

function round(
  id: string,
  edge: 'disc' | 'pebble',
  pattern: SheetPattern,
  value: Tones,
  [xPercent, yPercent, sizePx]: readonly [number, number, number],
  rotationDeg: number,
  visibility: SheetVisibility,
): SheetPlacement {
  return {
    ...tones(value),
    edge,
    id,
    pattern,
    rotationDeg,
    sizePx,
    visibility,
    xPercent,
    yPercent,
  };
}

function cut(
  id: string,
  shape: CutOutShape,
  color: CutOutColor,
  sizePx: number,
  rotationDeg: number,
  [xPercent, yPercent]: readonly [number, number],
  visibility: CutOutPlacement['visibility'],
  zIndex: CutOutPlacement['zIndex'],
  options: { mirrored?: true; underprint?: CutOutPlacement['underprint'] } = {},
): CutOutPlacement {
  return {
    color,
    id,
    rotationDeg,
    shape,
    sizePx,
    visibility,
    xPercent,
    yPercent,
    zIndex,
    ...options,
  };
}

/** Record-store warmth: gingham and dotted paper, pebbles, broad tropical leaves. */
export const ALBUMS_BACKDROP: Backdrop = {
  bandHeightPx: 1300,
  bands: [
    {
      cutOuts: [
        cut('albums-philo', 'philo', 'leaf', 300, -20, [47, -3], 'desktop', 0),
        cut('albums-gerbe', 'gerbe', 'vermilion', 300, 18, [87, 21], 'desktop', 1),
        cut('albums-star', 'star5', 'star', 46, 12, [52, 4], 'desktop', 1),
        cut('albums-trefoil', 'trefoil', 'rose', 150, -10, [2, 48], 'all', 1),
        cut('albums-banana', 'banana', 'olive', 380, 30, [-6, 70], 'desktop', 0, {
          mirrored: true,
        }),
      ],
      sheets: [
        torn('albums-gingham', 'gingham', ['ochre', 'vermilion'], [60, 1, 44, 330], -2, 'desktop'),
        round('albums-pebble', 'pebble', 'solid', 'viridian', [-9, 38, 420], -8, 'all'),
      ],
    },
    {
      cutOuts: [
        cut('albums-philo-right', 'philo', 'viridian', 360, 22, [86, 2], 'desktop', 0, {
          mirrored: true,
        }),
        cut('albums-gerbe-left', 'gerbe', 'ochre', 220, -14, [-4, 16], 'desktop', 1),
        cut('albums-trefoil-ochre', 'trefoil', 'ochre', 160, -6, [89, 60], 'all', 1),
        cut('albums-heart', 'heart', 'vermilion', 90, -12, [4, 66], 'desktop', 1),
        cut('albums-star-cream', 'star4', 'cream', 40, 8, [81, 38], 'desktop', 1),
      ],
      sheets: [
        torn('albums-dots', 'dots', ['rose', 'cream'], [74, 20, 30, 560], 2.5, 'all'),
        round(
          'albums-pebble-dots',
          'pebble',
          'dots',
          ['chartreuse', 'olive'],
          [-8, 62, 320],
          -6,
          'desktop',
        ),
      ],
    },
    {
      cutOuts: [
        cut('albums-monstera', 'monstera', 'olive', 520, -150, [84, -6], 'desktop', 0),
        cut('albums-gerbe-rose', 'gerbe', 'rose', 220, 18, [3, 46], 'desktop', 1),
        cut('albums-trefoil-cream', 'trefoil', 'cream', 140, -14, [87, 70], 'desktop', 1),
        cut('albums-heart-rose', 'heart', 'rose', 80, 10, [6, 86], 'all', 1),
      ],
      sheets: [
        torn('albums-gingham-green', 'gingham', ['viridian', 'leaf'], [-6, 8, 30, 460], 1.8, 'all'),
        round(
          'albums-pebble-ochre',
          'pebble',
          'dots',
          ['ochre', 'cream'],
          [80, 58, 340],
          6,
          'desktop',
        ),
      ],
    },
  ],
  repeat: 14,
};

/** Fills the margins beside the open album's well. */
export const ALBUM_DETAIL_BACKDROP: Backdrop = {
  bandHeightPx: 'fill',
  bands: [
    {
      cutOuts: [
        cut('album-detail-seaweed', 'seaweed2', 'ochre', 240, -10, [-3, 40], 'desktop', 0),
        cut('album-detail-swallow', 'swallow', 'rose', 170, -10, [89, 18], 'desktop', 1, {
          mirrored: true,
        }),
        cut('album-detail-coral', 'coral', 'vermilion', 200, 14, [90, 62], 'desktop', 1),
        cut('album-detail-star', 'star4', 'cream', 40, 12, [93, 86], 'desktop', 1),
      ],
      sheets: [
        torn(
          'album-detail-stripes',
          'stripes',
          ['rose', 'vermilion'],
          [-4, -6, 14, 300],
          -3,
          'desktop',
        ),
        round('album-detail-disc', 'disc', 'solid', 'rose', [88, -6, 190], 0, 'desktop'),
      ],
    },
  ],
  repeat: 1,
};
