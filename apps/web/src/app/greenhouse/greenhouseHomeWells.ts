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

export type HomeLivePage = {
  cells: ReadonlyArray<NamedRect>;
  footer: NamedRect;
  header: NamedRect;
  scrollHeight: number;
};

/**
 * Every `[data-greenhouse-cell]`, the sticky header, and the footer,
 * measured from `/greenhouse/m1-shot` at deviceScaleFactor 1 after the
 * frame's `--greenhouse-fringe` pad. Document-space Y.
 */
export const HOME_LIVE_WELL_WIDTHS = [390, 768, 1024, 1440, 1920, 2560] as const;

export type HomeLiveWellWidth = (typeof HOME_LIVE_WELL_WIDTHS)[number];

const HOME_LIVE_PAGES: Record<HomeLiveWellWidth, HomeLivePage> = {
  390: {
    cells: [
      { height: 555, id: 'cell-intro', width: 358, x: 16, y: 109 },
      { height: 313, id: 'cell-now-playing', width: 358, x: 16, y: 684 },
      { height: 269, id: 'cell-activity', width: 358, x: 16, y: 1017 },
      { height: 259, id: 'cell-featured', width: 358, x: 16, y: 1306 },
      { height: 236, id: 'cell-more-4', width: 358, x: 16, y: 1585 },
      { height: 236, id: 'cell-more-5', width: 358, x: 16, y: 1841 },
      { height: 236, id: 'cell-more-6', width: 358, x: 16, y: 2098 },
      { height: 358, id: 'cell-more-7', width: 358, x: 16, y: 2354 },
      { height: 177, id: 'cell-more-8', width: 358, x: 16, y: 2732 },
    ],
    footer: { height: 88, id: 'footer', width: 390, x: 0, y: 3064 },
    header: { height: 105, id: 'header-bar', width: 390, x: 0, y: 0 },
    scrollHeight: 3152,
  },
  768: {
    cells: [
      { height: 233, id: 'cell-intro', width: 408, x: 173, y: 113 },
      { height: 348, id: 'cell-now-playing', width: 408, x: 173, y: 367 },
      { height: 327, id: 'cell-activity', width: 229, x: 173, y: 736 },
      { height: 327, id: 'cell-featured', width: 158, x: 423, y: 736 },
      { height: 258, id: 'cell-more-4', width: 193, x: 173, y: 1084 },
      { height: 277, id: 'cell-more-5', width: 193, x: 387, y: 1084 },
      { height: 258, id: 'cell-more-6', width: 193, x: 173, y: 1382 },
      { height: 272, id: 'cell-more-7', width: 193, x: 387, y: 1382 },
      { height: 214, id: 'cell-more-8', width: 193, x: 173, y: 1676 },
    ],
    footer: { height: 88, id: 'footer', width: 700, x: 27, y: 2066 },
    header: { height: 78, id: 'header-bar', width: 753, x: 0, y: 0 },
    scrollHeight: 2183,
  },
  1024: {
    cells: [
      { height: 337, id: 'cell-intro', width: 614, x: 197, y: 119 },
      { height: 461, id: 'cell-now-playing', width: 614, x: 197, y: 479 },
      { height: 270, id: 'cell-activity', width: 349, x: 197, y: 962 },
      { height: 270, id: 'cell-featured', width: 243, x: 569, y: 962 },
      { height: 245, id: 'cell-more-4', width: 296, x: 197, y: 1255 },
      { height: 265, id: 'cell-more-5', width: 296, x: 516, y: 1255 },
      { height: 265, id: 'cell-more-6', width: 296, x: 197, y: 1542 },
      { height: 288, id: 'cell-more-7', width: 296, x: 516, y: 1542 },
      { height: 200, id: 'cell-more-8', width: 296, x: 197, y: 1853 },
    ],
    footer: { height: 88, id: 'footer', width: 920, x: 45, y: 2229 },
    header: { height: 78, id: 'header-bar', width: 1009, x: 0, y: 0 },
    scrollHeight: 2352,
  },
  1440: {
    cells: [
      { height: 315, id: 'cell-intro', width: 568, x: 281, y: 126 },
      { height: 315, id: 'cell-now-playing', width: 272, x: 872, y: 126 },
      { height: 278, id: 'cell-activity', width: 494, x: 281, y: 465 },
      { height: 278, id: 'cell-featured', width: 346, x: 798, y: 465 },
      { height: 250, id: 'cell-more-4', width: 272, x: 281, y: 767 },
      { height: 270, id: 'cell-more-5', width: 272, x: 576, y: 767 },
      { height: 270, id: 'cell-more-6', width: 272, x: 872, y: 767 },
      { height: 304, id: 'cell-more-7', width: 272, x: 281, y: 1061 },
      { height: 206, id: 'cell-more-8', width: 272, x: 576, y: 1061 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 148, y: 1542 },
    header: { height: 78, id: 'header-bar', width: 1425, x: 0, y: 0 },
    scrollHeight: 1673,
  },
  1920: {
    cells: [
      { height: 411, id: 'cell-intro', width: 760, x: 377, y: 126 },
      { height: 411, id: 'cell-now-playing', width: 368, x: 1160, y: 126 },
      { height: 372, id: 'cell-activity', width: 662, x: 377, y: 561 },
      { height: 372, id: 'cell-featured', width: 466, x: 1062, y: 561 },
      { height: 250, id: 'cell-more-4', width: 368, x: 377, y: 957 },
      { height: 270, id: 'cell-more-5', width: 368, x: 768, y: 957 },
      { height: 250, id: 'cell-more-6', width: 368, x: 1160, y: 957 },
      { height: 304, id: 'cell-more-7', width: 368, x: 377, y: 1251 },
      { height: 193, id: 'cell-more-8', width: 368, x: 768, y: 1251 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 388, y: 1732 },
    header: { height: 78, id: 'header-bar', width: 1905, x: 0, y: 0 },
    scrollHeight: 1863,
  },
  2560: {
    cells: [
      { height: 439, id: 'cell-intro', width: 853, x: 627, y: 126 },
      { height: 439, id: 'cell-now-playing', width: 415, x: 1504, y: 126 },
      { height: 418, id: 'cell-activity', width: 744, x: 627, y: 589 },
      { height: 418, id: 'cell-featured', width: 524, x: 1394, y: 589 },
      { height: 250, id: 'cell-more-4', width: 415, x: 627, y: 1031 },
      { height: 250, id: 'cell-more-5', width: 415, x: 1065, y: 1031 },
      { height: 250, id: 'cell-more-6', width: 415, x: 1504, y: 1031 },
      { height: 311, id: 'cell-more-7', width: 415, x: 627, y: 1305 },
      { height: 179, id: 'cell-more-8', width: 415, x: 1065, y: 1305 },
    ],
    footer: { height: 89, id: 'footer', width: 1130, x: 708, y: 1793 },
    header: { height: 78, id: 'header-bar', width: 2545, x: 0, y: 0 },
    scrollHeight: 1924,
  },
};

export function nearestHomeLiveWidth(width: number): HomeLiveWellWidth {
  return HOME_LIVE_WELL_WIDTHS.reduce((best, candidate) =>
    Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best,
  );
}

export function homeLivePage(size: ViewportSize): HomeLivePage {
  return HOME_LIVE_PAGES[nearestHomeLiveWidth(size.width)];
}

/**
 * Document-space wells. Header stays viewport-sticky (y as measured at
 * scroll 0). Cells and footer are page-absolute.
 */
export function homeDocumentWells(size: ViewportSize): ReadonlyArray<NamedRect> {
  const page = homeLivePage(size);
  return [page.header, ...page.cells, page.footer];
}

export function homeScrollStops(size: ViewportSize): ReadonlyArray<number> {
  const max = Math.max(0, homeLivePage(size).scrollHeight - size.height);
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
 * Shift a document-space well into the visual viewport at `scrollY`.
 * The header is sticky and stays at its measured y.
 */
export function wellInViewport(
  well: NamedRect,
  scrollY: number,
  viewportHeight: number,
): NamedRect | null {
  if (well.id === 'header-bar') {
    if (well.y >= viewportHeight || well.height <= 0) {
      return null;
    }
    return well;
  }
  const y = well.y - scrollY;
  if (y + well.height <= 0 || y >= viewportHeight) {
    return null;
  }
  const top = Math.max(0, y);
  const bottom = Math.min(viewportHeight, y + well.height);
  return { ...well, height: bottom - top, y: top };
}
