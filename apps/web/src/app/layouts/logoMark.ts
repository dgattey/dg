import { PAPER_PALETTE } from '../collage/paperPalette';

export type MarkPart = 'letter' | 'dot';

/**
 * Outlines of the `dg.` mark, so the logo, icons, and social card draw the same
 * glyphs everywhere instead of depending on the platform's system font. The
 * `g` and `.` sit a few units tighter than the font's own spacing to match the
 * original text logo's -0.12em tracking.
 */
export const MARK_PATHS = [
  {
    d: 'M121.48 362.59c-15.478 0-28.976-3.296-40.493-9.887-11.517-6.59-20.444-15.91-26.78-27.957-6.337-12.048-9.505-26.262-9.505-42.642v-.214c0-16.444 3.172-30.686 9.517-42.727 6.345-12.04 15.272-21.34 26.78-27.898 11.509-6.559 25.01-9.838 40.504-9.838 9.806 0 18.662 1.315 26.567 3.945 7.905 2.63 14.772 6.322 20.603 11.075 5.83 4.752 10.488 10.296 13.973 16.632h.974V153.26h53.705V359H183.62v-27.635h-.974c-3.454 6.257-8.088 11.722-13.902 16.395s-12.681 8.313-20.603 10.92c-7.92 2.606-16.808 3.91-26.66 3.91zm19.747-39.188c8.555 0 16.008-1.667 22.36-5 6.353-3.335 11.272-8.091 14.757-14.27 3.486-6.178 5.23-13.505 5.23-21.981v-.214c0-8.476-1.756-15.8-5.265-21.97-3.51-6.17-8.429-10.922-14.757-14.257-6.328-3.335-13.77-5.003-22.325-5.003-8.585 0-16.011 1.64-22.277 4.92-6.266 3.278-11.11 7.995-14.532 14.15-3.422 6.155-5.133 13.526-5.133 22.113v.214c0 8.602 1.703 15.984 5.11 22.146 3.406 6.162 8.25 10.895 14.531 14.198 6.282 3.303 13.716 4.954 22.301 4.954z',
    dx: 0,
    part: 'letter',
  },
  {
    d: 'M320.386 413.18c-17.22 0-32.235-2-45.044-6-12.808-4.001-23.065-9.538-30.772-16.611-7.707-7.073-12.55-15.204-14.532-24.393l-.307-1.306h53.253l.474.807c2.314 3.96 6.592 7.272 12.833 9.934 6.242 2.661 14.313 3.992 24.213 3.992 14.353 0 25.066-2.836 32.14-8.507 7.074-5.671 10.611-13.608 10.611-23.812v-20.197h-.904c-3.437 5.67-8.066 10.637-13.888 14.899-5.822 4.261-12.698 7.588-20.627 9.98-7.93 2.392-16.758 3.588-26.484 3.588-15.32 0-28.73-3.097-40.232-9.291-11.501-6.194-20.428-14.95-26.78-26.27s-9.528-24.686-9.528-40.1v-.213c0-16.016 3.2-29.855 9.6-41.515 6.399-11.66 15.361-20.678 26.886-27.054 11.525-6.376 24.987-9.564 40.386-9.564 9.647 0 18.392 1.319 26.234 3.957 7.842 2.637 14.662 6.3 20.46 10.99 5.798 4.688 10.44 10.122 13.926 16.3h.951v-27.682h53.728V345.48c0 14.146-3.814 26.277-11.442 36.392-7.628 10.115-18.646 17.861-33.054 23.24-14.408 5.379-31.775 8.068-52.101 8.068zm.902-92.39c8.412 0 15.775-1.628 22.089-4.884 6.313-3.256 11.216-7.901 14.71-13.937 3.493-6.036 5.24-13.188 5.24-21.458v-.214c0-8.286-1.755-15.438-5.265-21.458-3.51-6.02-8.416-10.657-14.721-13.912-6.305-3.256-13.656-4.884-22.053-4.884-8.396 0-15.742 1.608-22.04 4.823-6.297 3.216-11.18 7.814-14.65 13.795-3.469 5.98-5.203 13.177-5.203 21.59v.213c0 8.412 1.727 15.632 5.18 21.66 3.454 6.027 8.337 10.645 14.65 13.853 6.313 3.208 13.667 4.812 22.063 4.812z',
    dx: -4,
    part: 'letter',
  },
  {
    d: 'M435.67 361.281c-8.08 0-14.776-2.566-20.091-7.699-5.315-5.133-7.972-11.462-7.972-18.987 0-7.54 2.665-13.877 7.995-19.01 5.33-5.133 12.02-7.699 20.068-7.699 8.063 0 14.753 2.566 20.068 7.7 5.316 5.132 7.973 11.469 7.973 19.009 0 7.525-2.665 13.854-7.996 18.987-5.331 5.133-12.013 7.7-20.045 7.7z',
    dx: -6,
    part: 'dot',
  },
] as const satisfies ReadonlyArray<{ d: string; dx: number; part: MarkPart }>;

export const MARK_VIEW_BOX = '44.7 153.26 413.01 259.92';

/**
 * The die-cut mat's stroke, in mark units. Wide enough to read as a sticker in
 * the header, thin enough that the mark still fills a 16px favicon.
 */
export const STICKER_MAT_WIDTH = 80;

const [markX = 0, markY = 0, markWidth = 1, markHeight = 1] = MARK_VIEW_BOX.split(' ').map(Number);

export const STICKER_WIDTH = markWidth + STICKER_MAT_WIDTH;
export const STICKER_ASPECT = STICKER_WIDTH / (markHeight + STICKER_MAT_WIDTH);

function stickerViewBox(pad: number) {
  return [
    markX - STICKER_MAT_WIDTH / 2 - pad,
    markY - STICKER_MAT_WIDTH / 2 - pad,
    STICKER_WIDTH + 2 * pad,
    markHeight + STICKER_MAT_WIDTH + 2 * pad,
  ].join(' ');
}

export const STICKER_VIEW_BOX = stickerViewBox(0);

/**
 * Room on every side for a shadow painted inside the SVG, in mark units. Satori
 * clips a CSS drop shadow to the SVG's own box, so the shadow has to fit inside it.
 */
export const STICKER_SHADOW_PAD = 100;
export const STICKER_SHADOW_VIEW_BOX = stickerViewBox(STICKER_SHADOW_PAD);

export type StickerInks = Record<MarkPart | 'mat', string>;

/** Day-scheme inks, for renderers that can't read CSS variables. */
export const STICKER_PALETTE_INKS: StickerInks = {
  dot: PAPER_PALETTE.vermilion,
  letter: PAPER_PALETTE.viridian,
  mat: PAPER_PALETTE.cream,
};

function shift(dx: number) {
  return dx ? `translate(${dx} 0)` : undefined;
}

/**
 * The sticker's paths in paint order. The mat strokes each glyph's first
 * subpath, its outside edge, so the paper fills the counters like a real die cut.
 */
export function stickerPaths(inks: StickerInks) {
  return {
    glyphs: MARK_PATHS.map(({ d, dx, part }) => ({ d, fill: inks[part], transform: shift(dx) })),
    mat: MARK_PATHS.map(({ d, dx }) => ({
      d: d.slice(0, d.search(/z/i) + 1),
      transform: shift(dx),
    })),
  };
}
