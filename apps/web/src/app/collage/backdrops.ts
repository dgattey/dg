import { type CutOutPlacement, definePlacements, type PlacementRow } from './cutOutPlacements';
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
type SheetFields = [pattern: SheetPattern, tones: Tones, xPercent: number, yPercent: number];
type SheetRow =
  | readonly [
      id: string,
      edge: 'torn',
      ...SheetFields,
      widthPercent: number,
      heightPx: number,
      rotationDeg: number,
      visibility: SheetVisibility,
    ]
  | readonly [
      id: string,
      edge: 'disc' | 'pebble',
      ...SheetFields,
      sizePx: number,
      rotationDeg: number,
      visibility: SheetVisibility,
    ];

function defineSheet(row: SheetRow): SheetPlacement {
  const [id, , pattern, value, xPercent, yPercent] = row;
  const base = {
    ...(typeof value === 'string' ? { tone: value } : { accent: value[1], tone: value[0] }),
    id,
    pattern,
    xPercent,
    yPercent,
  };
  if (row[1] === 'torn') {
    const [, edge, , , , , widthPercent, heightPx, rotationDeg, visibility] = row;
    return { ...base, edge, heightPx, rotationDeg, visibility, widthPercent };
  }
  const [, edge, , , , , sizePx, rotationDeg, visibility] = row;
  return { ...base, edge, rotationDeg, sizePx, visibility };
}

function defineBackdrop(
  bandHeightPx: Backdrop['bandHeightPx'],
  repeat: number,
  bands: ReadonlyArray<{ cutOuts: ReadonlyArray<PlacementRow>; sheets: ReadonlyArray<SheetRow> }>,
): Backdrop {
  return {
    bandHeightPx,
    bands: bands.map(({ cutOuts, sheets }) => ({
      cutOuts: definePlacements(cutOuts),
      sheets: sheets.map(defineSheet),
    })),
    repeat,
  };
}

/** Record-store warmth: gingham and dotted paper, pebbles, broad tropical leaves. */
// biome-ignore format: placement rows read as a table
export const ALBUMS_BACKDROP = defineBackdrop(1300, 14, [
  {
    cutOuts: [
      ['albums-philo', 'philo', 'leaf', 300, -20, 47, -3, 'desktop', 0],
      ['albums-gerbe', 'gerbe', 'vermilion', 300, 18, 87, 21, 'desktop', 1],
      ['albums-star', 'star5', 'star', 46, 12, 52, 4, 'desktop', 1],
      ['albums-trefoil', 'trefoil', 'rose', 150, -10, 2, 48, 'all', 1],
      ['albums-banana', 'banana', 'olive', 380, 30, -6, 70, 'desktop', 0, { mirrored: true }],
    ],
    sheets: [
      ['albums-gingham', 'torn', 'gingham', ['ochre', 'vermilion'], 60, 1, 44, 330, -2, 'desktop'],
      ['albums-pebble', 'pebble', 'solid', 'viridian', -9, 38, 420, -8, 'all'],
    ],
  },
  {
    cutOuts: [
      ['albums-philo-right', 'philo', 'viridian', 360, 22, 86, 2, 'desktop', 0, { mirrored: true }],
      ['albums-gerbe-left', 'gerbe', 'ochre', 220, -14, -4, 16, 'desktop', 1],
      ['albums-trefoil-ochre', 'trefoil', 'ochre', 160, -6, 89, 60, 'all', 1],
      ['albums-heart', 'heart', 'vermilion', 90, -12, 4, 66, 'desktop', 1],
      ['albums-star-cream', 'star4', 'cream', 40, 8, 81, 38, 'desktop', 1],
    ],
    sheets: [
      ['albums-dots', 'torn', 'dots', ['rose', 'cream'], 74, 20, 30, 560, 2.5, 'all'],
      ['albums-pebble-dots', 'pebble', 'dots', ['chartreuse', 'olive'], -8, 62, 320, -6, 'desktop'],
    ],
  },
  {
    cutOuts: [
      ['albums-monstera', 'monstera', 'olive', 520, -150, 84, -6, 'desktop', 0],
      ['albums-gerbe-rose', 'gerbe', 'rose', 220, 18, 3, 46, 'desktop', 1],
      ['albums-trefoil-cream', 'trefoil', 'cream', 140, -14, 87, 70, 'desktop', 1],
      ['albums-heart-rose', 'heart', 'rose', 80, 10, 6, 86, 'all', 1],
    ],
    sheets: [
      ['albums-gingham-green', 'torn', 'gingham', ['viridian', 'leaf'], -6, 8, 30, 460, 1.8, 'all'],
      ['albums-pebble-ochre', 'pebble', 'dots', ['ochre', 'cream'], 80, 58, 340, 6, 'desktop'],
    ],
  },
]);

/** Fills the margins beside the open album's well. */
// biome-ignore format: placement rows read as a table
export const ALBUM_DETAIL_BACKDROP = defineBackdrop('fill', 1, [
  {
    cutOuts: [
      ['album-detail-seaweed', 'seaweed2', 'ochre', 240, -10, -3, 40, 'desktop', 0],
      ['album-detail-swallow', 'swallow', 'rose', 170, -10, 89, 18, 'desktop', 1, { mirrored: true }],
      ['album-detail-coral', 'coral', 'vermilion', 200, 14, 90, 62, 'desktop', 1],
      ['album-detail-star', 'star4', 'cream', 40, 12, 93, 86, 'desktop', 1],
    ],
    sheets: [
      ['album-detail-stripes', 'torn', 'stripes', ['rose', 'vermilion'], -4, -6, 14, 300, -3, 'desktop'],
      ['album-detail-disc', 'disc', 'solid', 'rose', 88, -6, 190, 0, 'desktop'],
    ],
  },
]);
