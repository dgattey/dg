type OfflineTile = {
  retina: boolean;
  style: string;
  x: number;
  y: number;
  zoom: number;
};

const PALETTES = {
  dark: { edge: 'hsl(24 80% 64%)', grid: 'hsl(24 30% 80% / 0.22)', ink: 'hsl(24 30% 92%)' },
  light: { edge: 'hsl(4 72% 46%)', grid: 'hsl(24 30% 30% / 0.24)', ink: 'hsl(210 40% 18%)' },
} as const;

const PAPER = {
  dark: ['hsl(183 70% 14%)', 'hsl(203 60% 18%)'],
  light: ['hsl(24 52% 94%)', 'hsl(40 60% 86%)'],
} as const;

const GRID_LINES = [32, 64, 96, 128, 160, 192, 224]
  .map((at) => `M${at} 0V256M0 ${at}H256`)
  .join('');

/**
 * A 256px debug tile labelled with its z/x/y, served for `MAP_TILES=offline`
 * at the same path Stadia uses. Neighbours alternate paper colours and every
 * tile has a hard edge and corner ticks, so a tile drawn in the wrong slot or
 * drifting from the routes is obvious in a screenshot. Like a raster tile it
 * stretches to fill its box, because frameTiles lays tiles out at the card's
 * aspect ratio and scales them square.
 */
export function offlineTileSvg({ retina, style, x, y, zoom }: OfflineTile) {
  const scheme = style.endsWith('_dark') ? 'dark' : 'light';
  const { edge, grid, ink } = PALETTES[scheme];
  const paper = PAPER[scheme][(x + y) % 2];
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" preserveAspectRatio="none">',
    `<rect width="256" height="256" fill="${paper}"/>`,
    `<path d="${GRID_LINES}" stroke="${grid}" stroke-width="1"/>`,
    `<rect x="1.5" y="1.5" width="253" height="253" fill="none" stroke="${edge}" stroke-width="3"/>`,
    `<path d="M0 24V0H24M232 0H256V24M256 232V256H232M24 256H0V232" fill="none" stroke="${ink}" stroke-width="6"/>`,
    `<path d="M120 128H136M128 120V136" stroke="${edge}" stroke-width="2"/>`,
    `<g fill="${ink}" font-family="ui-monospace, Menlo, monospace" font-weight="700" text-anchor="middle">`,
    `<text x="128" y="104" font-size="26">z${zoom}</text>`,
    `<text x="128" y="170" font-size="22">${x}/${y}</text>`,
    retina ? '<text x="128" y="200" font-size="14">@2x</text>' : '',
    '</g>',
    '</svg>',
  ].join('');
}
