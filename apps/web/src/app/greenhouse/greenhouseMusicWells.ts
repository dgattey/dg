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
 * `[data-greenhouse-cell]` + header + footer, measured from
 * `/greenhouse/music-shot` and `?view=albums` at deviceScaleFactor 1.
 * `albums-status` is not in the fixture DOM (empty/error only).
 */
export const MUSIC_LIVE_WELL_WIDTHS = [390, 768, 1024, 1440, 1920, 2560] as const;

export type MusicLiveWellWidth = (typeof MUSIC_LIVE_WELL_WIDTHS)[number];

export const MUSIC_LIVE_VIEWS = [
  'listening',
  'albums',
] as const satisfies ReadonlyArray<MusicLiveView>;

const MUSIC_LISTENING_PAGES: Record<MusicLiveWellWidth, MusicLivePage> = {
  390: {
    cells: [
      { height: 128, id: 'cell-intro', width: 358, x: 16, y: 109 },
      { height: 455, id: 'cell-now-playing', width: 358, x: 16, y: 257 },
      { height: 400, id: 'cell-albums', width: 358, x: 16, y: 732 },
      { height: 55, id: 'cell-on-repeat-heading', width: 358, x: 16, y: 732 },
      { height: 790, id: 'cell-history', width: 358, x: 16, y: 1152 },
      { height: 201, id: 'cell-tracks', width: 358, x: 16, y: 1962 },
      { height: 201, id: 'cell-artists', width: 358, x: 16, y: 2183 },
      { height: 329, id: 'cell-on-repeat-pile-0', width: 279, x: 16, y: 799 },
      { height: 329, id: 'cell-on-repeat-pile-1', width: 279, x: 311, y: 799 },
      { height: 329, id: 'cell-on-repeat-pile-2', width: 279, x: 606, y: 799 },
    ],
    footer: { height: 88, id: 'footer', width: 390, x: 0, y: 2538 },
    header: { height: 105, id: 'header-bar', width: 390, x: 0, y: 0 },
    scrollHeight: 2626,
  },
  768: {
    cells: [
      { height: 136, id: 'cell-intro', width: 408, x: 173, y: 113 },
      { height: 170, id: 'cell-now-playing', width: 408, x: 173, y: 270 },
      { height: 274, id: 'cell-albums', width: 408, x: 173, y: 462 },
      { height: 61, id: 'cell-on-repeat-heading', width: 408, x: 173, y: 462 },
      { height: 489, id: 'cell-history', width: 408, x: 173, y: 757 },
      { height: 215, id: 'cell-tracks', width: 193, x: 173, y: 1267 },
      { height: 215, id: 'cell-artists', width: 193, x: 387, y: 1267 },
      { height: 201, id: 'cell-on-repeat-pile-0', width: 120, x: 173, y: 534 },
      { height: 201, id: 'cell-on-repeat-pile-1', width: 120, x: 317, y: 534 },
      { height: 201, id: 'cell-on-repeat-pile-2', width: 120, x: 461, y: 534 },
    ],
    footer: { height: 88, id: 'footer', width: 700, x: 27, y: 1659 },
    header: { height: 78, id: 'header-bar', width: 753, x: 0, y: 0 },
    scrollHeight: 1776,
  },
  1024: {
    cells: [
      { height: 149, id: 'cell-intro', width: 614, x: 197, y: 119 },
      { height: 256, id: 'cell-now-playing', width: 614, x: 197, y: 291 },
      { height: 329, id: 'cell-albums', width: 614, x: 197, y: 569 },
      { height: 64, id: 'cell-on-repeat-heading', width: 614, x: 197, y: 569 },
      { height: 516, id: 'cell-history', width: 614, x: 197, y: 921 },
      { height: 206, id: 'cell-tracks', width: 296, x: 197, y: 1460 },
      { height: 206, id: 'cell-artists', width: 296, x: 516, y: 1460 },
      { height: 254, id: 'cell-on-repeat-pile-0', width: 189, x: 197, y: 645 },
      { height: 254, id: 'cell-on-repeat-pile-1', width: 189, x: 410, y: 645 },
      { height: 254, id: 'cell-on-repeat-pile-2', width: 189, x: 623, y: 645 },
    ],
    footer: { height: 88, id: 'footer', width: 920, x: 45, y: 1843 },
    header: { height: 78, id: 'header-bar', width: 1009, x: 0, y: 0 },
    scrollHeight: 1966,
  },
  1440: {
    cells: [
      { height: 168, id: 'cell-intro', width: 272, x: 281, y: 194 },
      { height: 237, id: 'cell-now-playing', width: 568, x: 576, y: 126 },
      { height: 398, id: 'cell-albums', width: 864, x: 281, y: 387 },
      { height: 67, id: 'cell-on-repeat-heading', width: 864, x: 281, y: 387 },
      { height: 620, id: 'cell-history', width: 864, x: 281, y: 809 },
      { height: 212, id: 'cell-tracks', width: 420, x: 281, y: 1453 },
      { height: 212, id: 'cell-artists', width: 420, x: 724, y: 1453 },
      { height: 319, id: 'cell-on-repeat-pile-0', width: 272, x: 281, y: 466 },
      { height: 319, id: 'cell-on-repeat-pile-1', width: 272, x: 577, y: 466 },
      { height: 319, id: 'cell-on-repeat-pile-2', width: 272, x: 873, y: 466 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 148, y: 1841 },
    header: { height: 78, id: 'header-bar', width: 1425, x: 0, y: 0 },
    scrollHeight: 1972,
  },
  1920: {
    cells: [
      { height: 172, id: 'cell-intro', width: 368, x: 377, y: 271 },
      { height: 317, id: 'cell-now-playing', width: 760, x: 768, y: 126 },
      { height: 494, id: 'cell-albums', width: 1152, x: 377, y: 467 },
      { height: 67, id: 'cell-on-repeat-heading', width: 1152, x: 377, y: 467 },
      { height: 716, id: 'cell-history', width: 1152, x: 377, y: 985 },
      { height: 212, id: 'cell-tracks', width: 564, x: 377, y: 1725 },
      { height: 212, id: 'cell-artists', width: 564, x: 964, y: 1725 },
      { height: 415, id: 'cell-on-repeat-pile-0', width: 368, x: 377, y: 546 },
      { height: 415, id: 'cell-on-repeat-pile-1', width: 368, x: 769, y: 546 },
      { height: 415, id: 'cell-on-repeat-pile-2', width: 368, x: 1161, y: 546 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 388, y: 2113 },
    header: { height: 78, id: 'header-bar', width: 1905, x: 0, y: 0 },
    scrollHeight: 2244,
  },
  2560: {
    cells: [
      { height: 172, id: 'cell-intro', width: 415, x: 627, y: 310 },
      { height: 356, id: 'cell-now-playing', width: 853, x: 1065, y: 126 },
      { height: 541, id: 'cell-albums', width: 1292, x: 627, y: 505 },
      { height: 67, id: 'cell-on-repeat-heading', width: 1292, x: 627, y: 505 },
      { height: 763, id: 'cell-history', width: 1292, x: 627, y: 1070 },
      { height: 212, id: 'cell-tracks', width: 634, x: 627, y: 1857 },
      { height: 212, id: 'cell-artists', width: 634, x: 1284, y: 1857 },
      { height: 462, id: 'cell-on-repeat-pile-0', width: 415, x: 627, y: 584 },
      { height: 462, id: 'cell-on-repeat-pile-1', width: 415, x: 1065, y: 584 },
      { height: 462, id: 'cell-on-repeat-pile-2', width: 415, x: 1504, y: 584 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 708, y: 2245 },
    header: { height: 78, id: 'header-bar', width: 2545, x: 0, y: 0 },
    scrollHeight: 2376,
  },
};

const MUSIC_ALBUMS_PAGES: Record<MusicLiveWellWidth, MusicLivePage> = {
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
    scrollHeight: 1131,
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
    scrollHeight: 1081,
  },
  1920: {
    cells: [
      { height: 172, id: 'cell-albums-heading', width: 1152, x: 377, y: 126 },
      { height: 131, id: 'cell-albums-toolbar', width: 1152, x: 377, y: 321 },
      { height: 321, id: 'cell-albums-grid', width: 1152, x: 377, y: 469 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 388, y: 966 },
    header: { height: 78, id: 'header-bar', width: 1905, x: 0, y: 0 },
    scrollHeight: 1199,
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
