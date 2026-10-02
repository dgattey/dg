type OfflineTileColors = {
  grid: string;
  ink: string;
  paper: string;
};

/**
 * A 256px paper tile with faint contour lines. Each contour starts and ends at
 * the same height and slope, so neighbouring tiles join without a seam.
 */
const offlineTileSvg = ({ grid, ink, paper }: OfflineTileColors) =>
  [
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">',
    `<rect width="256" height="256" fill="${paper}"/>`,
    `<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-width="1.5">`,
    '<path d="M0 40C64 24 192 56 256 40"/>',
    '<path d="M0 104C64 120 192 88 256 104"/>',
    '<path d="M0 168C64 152 192 184 256 168"/>',
    '<path d="M0 232C64 248 192 216 256 232"/>',
    '</g>',
    `<path d="M0 .5H256M.5 0V256" stroke="${grid}" stroke-dasharray="2 6"/>`,
    '</svg>',
  ].join('');

const toDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Inline placeholder tiles, so offline maps make no network requests at all. */
export const OFFLINE_TILES = {
  dark: toDataUri(
    offlineTileSvg({
      grid: 'hsl(24 30% 80% / 0.14)',
      ink: 'hsl(24 58% 70% / 0.2)',
      paper: 'hsl(183 90% 14%)',
    }),
  ),
  light: toDataUri(
    offlineTileSvg({
      grid: 'hsl(24 30% 40% / 0.2)',
      ink: 'hsl(183 30% 35% / 0.22)',
      paper: 'hsl(24 52% 94%)',
    }),
  ),
} as const;
