import { wellInViewport } from './greenhouseHomeWells';

type ViewportSize = {
  height: number;
  width: number;
};

type NamedRect = {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
};

export type MusicLivePage = {
  cells: ReadonlyArray<NamedRect>;
  footer: NamedRect;
  header: NamedRect;
  scrollHeight: number;
};

export type MusicLiveView = 'albums' | 'listening';

/**
 * `[data-greenhouse-cell]` + header + footer from `/greenhouse/music-shot`.
 * Listening `on-repeat` is one glass card (overline + heading + stacks).
 * `albums-status` is not in the fixture DOM (empty/error only).
 */
export const MUSIC_LIVE_WELL_WIDTHS = [360, 390, 768, 1024, 1440, 1920, 2560] as const;

export type MusicLiveWellWidth = (typeof MUSIC_LIVE_WELL_WIDTHS)[number];

export const MUSIC_LIVE_VIEWS = [
  'listening',
  'albums',
] as const satisfies ReadonlyArray<MusicLiveView>;

const MUSIC_LISTENING_PAGES: Record<MusicLiveWellWidth, MusicLivePage> = {
  360: {
    cells: [
      { height: 128, id: 'cell-intro', width: 328, x: 16, y: 109 },
      { height: 434, id: 'cell-now-playing', width: 328, x: 16, y: 257 },
      { height: 370, id: 'cell-albums', width: 328, x: 16, y: 711 },
      { height: 370, id: 'cell-on-repeat', width: 328, x: 16, y: 711 },
      { height: 745, id: 'cell-history', width: 328, x: 16, y: 1101 },
      { height: 201, id: 'cell-tracks', width: 328, x: 16, y: 1866 },
      { height: 201, id: 'cell-artists', width: 328, x: 16, y: 2087 },
    ],
    footer: { height: 88, id: 'footer', width: 360, x: 0, y: 2443 },
    header: { height: 105, id: 'header-bar', width: 360, x: 0, y: 0 },
    scrollHeight: 2531,
  },
  390: {
    cells: [
      { height: 128, id: 'cell-intro', width: 358, x: 16, y: 109 },
      { height: 455, id: 'cell-now-playing', width: 358, x: 16, y: 257 },
      { height: 394, id: 'cell-albums', width: 358, x: 16, y: 732 },
      { height: 394, id: 'cell-on-repeat', width: 358, x: 16, y: 732 },
      { height: 790, id: 'cell-history', width: 358, x: 16, y: 1146 },
      { height: 201, id: 'cell-tracks', width: 358, x: 16, y: 1956 },
      { height: 201, id: 'cell-artists', width: 358, x: 16, y: 2177 },
    ],
    footer: { height: 88, id: 'footer', width: 390, x: 0, y: 2532 },
    header: { height: 105, id: 'header-bar', width: 390, x: 0, y: 0 },
    scrollHeight: 2620,
  },
  768: {
    cells: [
      { height: 136, id: 'cell-intro', width: 408, x: 173, y: 113 },
      { height: 170, id: 'cell-now-playing', width: 408, x: 173, y: 270 },
      { height: 273, id: 'cell-albums', width: 408, x: 173, y: 462 },
      { height: 273, id: 'cell-on-repeat', width: 408, x: 173, y: 462 },
      { height: 489, id: 'cell-history', width: 408, x: 173, y: 756 },
      { height: 215, id: 'cell-tracks', width: 193, x: 173, y: 1266 },
      { height: 215, id: 'cell-artists', width: 193, x: 387, y: 1266 },
    ],
    footer: { height: 88, id: 'footer', width: 700, x: 27, y: 1658 },
    header: { height: 78, id: 'header-bar', width: 753, x: 0, y: 0 },
    scrollHeight: 1775,
  },
  1024: {
    cells: [
      { height: 149, id: 'cell-intro', width: 614, x: 197, y: 119 },
      { height: 256, id: 'cell-now-playing', width: 614, x: 197, y: 291 },
      { height: 328, id: 'cell-albums', width: 614, x: 197, y: 569 },
      { height: 328, id: 'cell-on-repeat', width: 614, x: 197, y: 569 },
      { height: 516, id: 'cell-history', width: 614, x: 197, y: 919 },
      { height: 206, id: 'cell-tracks', width: 296, x: 197, y: 1458 },
      { height: 206, id: 'cell-artists', width: 296, x: 516, y: 1458 },
    ],
    footer: { height: 88, id: 'footer', width: 920, x: 45, y: 1841 },
    header: { height: 78, id: 'header-bar', width: 1009, x: 0, y: 0 },
    scrollHeight: 1964,
  },
  1440: {
    cells: [
      { height: 168, id: 'cell-intro', width: 272, x: 281, y: 194 },
      { height: 237, id: 'cell-now-playing', width: 568, x: 576, y: 126 },
      { height: 420, id: 'cell-albums', width: 864, x: 281, y: 387 },
      { height: 420, id: 'cell-on-repeat', width: 864, x: 281, y: 387 },
      { height: 620, id: 'cell-history', width: 864, x: 281, y: 831 },
      { height: 212, id: 'cell-tracks', width: 420, x: 281, y: 1475 },
      { height: 212, id: 'cell-artists', width: 420, x: 724, y: 1475 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 148, y: 1863 },
    header: { height: 78, id: 'header-bar', width: 1425, x: 0, y: 0 },
    scrollHeight: 1994,
  },
  1920: {
    cells: [
      { height: 172, id: 'cell-intro', width: 368, x: 377, y: 271 },
      { height: 317, id: 'cell-now-playing', width: 760, x: 768, y: 126 },
      { height: 516, id: 'cell-albums', width: 1152, x: 377, y: 467 },
      { height: 516, id: 'cell-on-repeat', width: 1152, x: 377, y: 467 },
      { height: 716, id: 'cell-history', width: 1152, x: 377, y: 1007 },
      { height: 212, id: 'cell-tracks', width: 564, x: 377, y: 1747 },
      { height: 212, id: 'cell-artists', width: 564, x: 964, y: 1747 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 388, y: 2135 },
    header: { height: 78, id: 'header-bar', width: 1905, x: 0, y: 0 },
    scrollHeight: 2266,
  },
  2560: {
    cells: [
      { height: 172, id: 'cell-intro', width: 415, x: 627, y: 310 },
      { height: 356, id: 'cell-now-playing', width: 853, x: 1065, y: 126 },
      { height: 563, id: 'cell-albums', width: 1292, x: 627, y: 505 },
      { height: 563, id: 'cell-on-repeat', width: 1292, x: 627, y: 505 },
      { height: 763, id: 'cell-history', width: 1292, x: 627, y: 1092 },
      { height: 212, id: 'cell-tracks', width: 634, x: 627, y: 1879 },
      { height: 212, id: 'cell-artists', width: 634, x: 1284, y: 1879 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 708, y: 2267 },
    header: { height: 78, id: 'header-bar', width: 2545, x: 0, y: 0 },
    scrollHeight: 2398,
  },
};

const MUSIC_ALBUMS_PAGES: Record<MusicLiveWellWidth, MusicLivePage> = {
  360: {
    cells: [
      { height: 128, id: 'cell-albums-heading', width: 328, x: 16, y: 109 },
      { height: 126, id: 'cell-albums-toolbar', width: 328, x: 16, y: 257 },
      { height: 345, id: 'cell-albums-grid', width: 328, x: 16, y: 399 },
    ],
    footer: { height: 88, id: 'footer', width: 360, x: 0, y: 899 },
    header: { height: 105, id: 'header-bar', width: 360, x: 0, y: 0 },
    scrollHeight: 987,
  },
  390: {
    cells: [
      { height: 128, id: 'cell-albums-heading', width: 358, x: 16, y: 109 },
      { height: 126, id: 'cell-albums-toolbar', width: 358, x: 16, y: 257 },
      { height: 375, id: 'cell-albums-grid', width: 358, x: 16, y: 399 },
    ],
    footer: { height: 88, id: 'footer', width: 390, x: 0, y: 929 },
    header: { height: 105, id: 'header-bar', width: 390, x: 0, y: 0 },
    scrollHeight: 1017,
  },
  768: {
    cells: [
      { height: 136, id: 'cell-albums-heading', width: 408, x: 173, y: 113 },
      { height: 123, id: 'cell-albums-toolbar', width: 408, x: 173, y: 270 },
      { height: 292, id: 'cell-albums-grid', width: 408, x: 173, y: 410 },
    ],
    footer: { height: 88, id: 'footer', width: 700, x: 27, y: 879 },
    header: { height: 78, id: 'header-bar', width: 753, x: 0, y: 0 },
    scrollHeight: 1146,
  },
  1024: {
    cells: [
      { height: 149, id: 'cell-albums-heading', width: 614, x: 197, y: 119 },
      { height: 127, id: 'cell-albums-toolbar', width: 614, x: 197, y: 291 },
      { height: 185, id: 'cell-albums-grid', width: 614, x: 197, y: 434 },
    ],
    footer: { height: 88, id: 'footer', width: 920, x: 45, y: 795 },
    header: { height: 78, id: 'header-bar', width: 1009, x: 0, y: 0 },
    scrollHeight: 1479,
  },
  1440: {
    cells: [
      { height: 168, id: 'cell-albums-heading', width: 864, x: 281, y: 126 },
      { height: 131, id: 'cell-albums-toolbar', width: 864, x: 281, y: 318 },
      { height: 249, id: 'cell-albums-grid', width: 864, x: 281, y: 465 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 148, y: 891 },
    header: { height: 78, id: 'header-bar', width: 1425, x: 0, y: 0 },
    scrollHeight: 1135,
  },
  1920: {
    cells: [
      { height: 172, id: 'cell-albums-heading', width: 1152, x: 377, y: 126 },
      { height: 131, id: 'cell-albums-toolbar', width: 1152, x: 377, y: 321 },
      { height: 321, id: 'cell-albums-grid', width: 1152, x: 377, y: 469 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 388, y: 966 },
    header: { height: 78, id: 'header-bar', width: 1905, x: 0, y: 0 },
    scrollHeight: 1256,
  },
  2560: {
    cells: [
      { height: 172, id: 'cell-albums-heading', width: 1292, x: 627, y: 126 },
      { height: 131, id: 'cell-albums-toolbar', width: 1292, x: 627, y: 321 },
      { height: 356, id: 'cell-albums-grid', width: 1292, x: 627, y: 469 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 708, y: 1001 },
    header: { height: 78, id: 'header-bar', width: 2545, x: 0, y: 0 },
    scrollHeight: 1559,
  },
};

export function nearestMusicLiveWidth(width: number): MusicLiveWellWidth {
  return MUSIC_LIVE_WELL_WIDTHS.reduce((best, candidate) =>
    Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best,
  );
}

export function musicLivePage(
  size: ViewportSize,
  view: MusicLiveView = 'listening',
): MusicLivePage {
  const key = nearestMusicLiveWidth(size.width);
  return view === 'albums' ? MUSIC_ALBUMS_PAGES[key] : MUSIC_LISTENING_PAGES[key];
}

export function musicDocumentWells(
  size: ViewportSize,
  view: MusicLiveView = 'listening',
): ReadonlyArray<NamedRect> {
  const page = musicLivePage(size, view);
  return [page.header, ...page.cells, page.footer];
}

export function musicScrollStops(
  size: ViewportSize,
  view: MusicLiveView = 'listening',
): ReadonlyArray<number> {
  const max = Math.max(0, musicLivePage(size, view).scrollHeight - size.height);
  const stops = [0];
  let y = size.height;
  while (y < max - 1) {
    stops.push(y);
    y += size.height;
  }
  if (max > 0) {
    stops.push(max);
  }
  return [...new Set(stops)];
}

/**
 * Clip a document-space well to the visual viewport. Kept for callers that
 * still pass document y and a fringe clip.
 */
export function visibleCopyWell(rect: NamedRect, viewportHeight: number): NamedRect | null {
  return wellInViewport(rect, 0, viewportHeight);
}

export function musicLiveWells(
  size: ViewportSize,
  _fringePx = 0,
  view: MusicLiveView = 'listening',
): ReadonlyArray<NamedRect> {
  return musicDocumentWells(size, view).flatMap((well) => {
    const visible = wellInViewport(well, 0, size.height);
    return visible ? [visible] : [];
  });
}
