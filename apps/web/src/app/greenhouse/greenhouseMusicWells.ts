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

/**
 * `[data-greenhouse-cell]` + `[data-music-heading]` + the On repeat
 * eyebrow, measured from `/greenhouse/music-shot` at deviceScaleFactor 1.
 * Pile captions live inside `cell-albums` (they are not their own cells).
 */
export const MUSIC_LIVE_WELL_WIDTHS = [390, 768, 1024, 1440, 1920, 2560] as const;

export type MusicLiveWellWidth = (typeof MUSIC_LIVE_WELL_WIDTHS)[number];

const MUSIC_LIVE_WELLS: Record<MusicLiveWellWidth, ReadonlyArray<NamedRect>> = {
  390: [
    { height: 88, id: 'music-heading', width: 358, x: 16, y: 109 },
    { height: 88, id: 'cell-intro', width: 358, x: 16, y: 109 },
    { height: 455, id: 'cell-now-playing', width: 358, x: 16, y: 217 },
    { height: 356, id: 'cell-albums', width: 358, x: 16, y: 692 },
    { height: 14, id: 'music-on-repeat', width: 358, x: 16, y: 692 },
    { height: 143, id: 'cell-tracks', width: 358, x: 16, y: 1068 },
    { height: 143, id: 'cell-artists', width: 358, x: 16, y: 1230 },
  ],
  768: [
    { height: 90, id: 'music-heading', width: 408, x: 173, y: 113 },
    { height: 90, id: 'cell-intro', width: 408, x: 173, y: 113 },
    { height: 170, id: 'cell-now-playing', width: 408, x: 173, y: 224 },
    { height: 194, id: 'cell-albums', width: 408, x: 173, y: 416 },
    { height: 14, id: 'music-on-repeat', width: 408, x: 173, y: 416 },
    { height: 144, id: 'cell-tracks', width: 193, x: 173, y: 631 },
    { height: 144, id: 'cell-artists', width: 193, x: 387, y: 631 },
  ],
  1024: [
    { height: 101, id: 'music-heading', width: 614, x: 197, y: 119 },
    { height: 101, id: 'cell-intro', width: 614, x: 197, y: 119 },
    { height: 256, id: 'cell-now-playing', width: 614, x: 197, y: 242 },
    { height: 265, id: 'cell-albums', width: 614, x: 197, y: 520 },
    { height: 15, id: 'music-on-repeat', width: 614, x: 197, y: 520 },
    { height: 148, id: 'cell-tracks', width: 296, x: 197, y: 808 },
    { height: 148, id: 'cell-artists', width: 296, x: 516, y: 808 },
  ],
  1440: [
    { height: 121, id: 'music-heading', width: 272, x: 281, y: 242 },
    { height: 121, id: 'cell-intro', width: 272, x: 281, y: 242 },
    { height: 237, id: 'cell-now-playing', width: 568, x: 576, y: 126 },
    { height: 352, id: 'cell-albums', width: 864, x: 281, y: 387 },
    { height: 16, id: 'music-on-repeat', width: 864, x: 281, y: 387 },
    { height: 154, id: 'cell-tracks', width: 420, x: 281, y: 762 },
    { height: 154, id: 'cell-artists', width: 420, x: 724, y: 762 },
  ],
  1920: [
    { height: 124, id: 'music-heading', width: 368, x: 377, y: 319 },
    { height: 124, id: 'cell-intro', width: 368, x: 377, y: 319 },
    { height: 317, id: 'cell-now-playing', width: 760, x: 768, y: 126 },
    { height: 448, id: 'cell-albums', width: 1152, x: 377, y: 467 },
    { height: 16, id: 'music-on-repeat', width: 1152, x: 377, y: 467 },
    { height: 154, id: 'cell-tracks', width: 564, x: 377, y: 938 },
    { height: 154, id: 'cell-artists', width: 564, x: 964, y: 938 },
  ],
  2560: [
    { height: 124, id: 'music-heading', width: 415, x: 627, y: 358 },
    { height: 124, id: 'cell-intro', width: 415, x: 627, y: 358 },
    { height: 356, id: 'cell-now-playing', width: 853, x: 1065, y: 126 },
    { height: 494, id: 'cell-albums', width: 1292, x: 627, y: 505 },
    { height: 16, id: 'music-on-repeat', width: 1292, x: 627, y: 505 },
    { height: 154, id: 'cell-tracks', width: 634, x: 627, y: 1024 },
    { height: 154, id: 'cell-artists', width: 634, x: 1284, y: 1024 },
  ],
};

export function nearestMusicLiveWidth(width: number): MusicLiveWellWidth {
  return MUSIC_LIVE_WELL_WIDTHS.reduce((best, candidate) =>
    Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best,
  );
}

/**
 * Clip a document-space well to the visual viewport. Fixed foliage cannot
 * cover copy that has scrolled off-screen.
 */
export function visibleCopyWell(rect: NamedRect, viewportHeight: number): NamedRect | null {
  if (rect.y >= viewportHeight || rect.height <= 0) {
    return null;
  }
  return {
    ...rect,
    height: Math.min(rect.height, viewportHeight - rect.y),
  };
}

/**
 * Album / tracks / artists cells extend into the bottom fringe so plants
 * may peek the card edge. Clip those wells above the dense band. Heading,
 * intro, now-playing, and On repeat stay full — that is the copy the
 * previous test missed.
 */
const FRINGE_CLIP_IDS = new Set(['cell-albums', 'cell-tracks', 'cell-artists']);

export function musicLiveWells(size: ViewportSize, fringePx: number): ReadonlyArray<NamedRect> {
  const key = nearestMusicLiveWidth(size.width);
  const maxY = size.height - fringePx;
  return MUSIC_LIVE_WELLS[key]
    .map((well) => {
      if (FRINGE_CLIP_IDS.has(well.id) && well.y < maxY) {
        return visibleCopyWell(
          { ...well, height: Math.min(well.height, maxY - well.y) },
          size.height,
        );
      }
      if (FRINGE_CLIP_IDS.has(well.id) && well.y >= maxY) {
        return null;
      }
      return visibleCopyWell(well, size.height);
    })
    .filter((well): well is NamedRect => well != null && well.height > 0);
}
