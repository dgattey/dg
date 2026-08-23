/**
 * Document-space stitch plan. Seams are structurally impossible: consecutive
 * frames abut (gap ≤ 1px, no overlap). Fixed header is cropped from frames
 * 2..n. Fixed bottom foliage is cropped from every frame except the last, so
 * the thicket appears once — at the true page end.
 */
export type StitchFrame = {
  cropBottom: number;
  cropTop: number;
  docBottom: number;
  docTop: number;
  scrollY: number;
};

export type StitchPlanInput = {
  fringeHeight: number;
  headerHeight: number;
  scrollHeight: number;
  viewportHeight: number;
};

export class StitchSeamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StitchSeamError';
  }
}

export function planStitchFrames({
  fringeHeight,
  headerHeight,
  scrollHeight,
  viewportHeight,
}: StitchPlanInput): ReadonlyArray<StitchFrame> {
  if (viewportHeight <= 0 || scrollHeight <= 0) {
    throw new StitchSeamError(`invalid metrics vh=${viewportHeight} sh=${scrollHeight}`);
  }
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  const fringe = Math.max(0, Math.min(fringeHeight, Math.floor(viewportHeight * 0.2)));
  const header = Math.max(0, Math.min(headerHeight, viewportHeight - 1));

  if (maxScroll === 0) {
    return [{ cropBottom: 0, cropTop: 0, docBottom: viewportHeight, docTop: 0, scrollY: 0 }];
  }

  const frames: Array<StitchFrame> = [];
  let covered = 0;
  for (let guard = 0; guard < 64 && covered < scrollHeight - 0.5; guard += 1) {
    const isFirst = frames.length === 0;
    const desired = isFirst ? 0 : covered - header;
    const scrollY = Math.max(0, Math.min(maxScroll, desired));
    const cropTop = Math.max(0, covered - scrollY);
    const last = scrollY >= maxScroll - 0.5;
    const cropBottom = last ? 0 : fringe;
    const docTop = scrollY + cropTop;
    const docBottom = scrollY + viewportHeight - cropBottom;
    if (docBottom <= docTop + 0.5) {
      throw new StitchSeamError(`empty frame at scrollY=${scrollY} crop ${cropTop}/${cropBottom}`);
    }
    frames.push({ cropBottom, cropTop, docBottom, docTop, scrollY });
    covered = docBottom;
    if (last) {
      break;
    }
  }

  assertFrameAbutment(frames);
  if (frames[frames.length - 1]?.docBottom < scrollHeight - 1) {
    throw new StitchSeamError(
      `plan stops at ${frames[frames.length - 1]?.docBottom} before scrollHeight ${scrollHeight}`,
    );
  }
  return frames;
}

/**
 * Recompute cropTop from the browser's actual scrollY so a short-scroll
 * cannot invent an intended step.
 */
export function realizeFrame(
  planned: StitchFrame,
  actualScrollY: number,
  covered: number,
  viewportHeight: number,
): StitchFrame {
  const cropTop = Math.max(0, covered - actualScrollY);
  const docTop = actualScrollY + cropTop;
  const docBottom = actualScrollY + viewportHeight - planned.cropBottom;
  if (cropTop < 0 || docBottom <= docTop + 0.5) {
    throw new StitchSeamError(
      `realized empty frame: actualScrollY=${actualScrollY} covered=${covered} cropTop=${cropTop}`,
    );
  }
  return {
    cropBottom: planned.cropBottom,
    cropTop,
    docBottom,
    docTop,
    scrollY: actualScrollY,
  };
}

export function assertFrameAbutment(frames: ReadonlyArray<StitchFrame>, maxGap = 1): void {
  for (let i = 0; i < frames.length - 1; i += 1) {
    const gap = frames[i + 1].docTop - frames[i].docBottom;
    if (gap > maxGap || gap < -0.01) {
      throw new StitchSeamError(
        `frames ${i}..${i + 1} do not abut: gap=${gap} (${frames[i].docBottom} → ${frames[i + 1].docTop})`,
      );
    }
  }
}

export type HeadingShot = {
  height: number;
  id: string;
  sticky: boolean;
  width: number;
  x: number;
  y: number;
};

export type HeadingAppearance = {
  height: number;
  id: string;
  stitchBottom: number;
  stitchTop: number;
};

/**
 * Map a heading's viewport box at one stop into stitch space. Returns null
 * when the box sits entirely in that frame's cropped header or fringe.
 */
export function headingInFrame(
  heading: HeadingShot,
  frame: StitchFrame,
  stitchOffset: number,
  viewportHeight: number,
): HeadingAppearance | null {
  const viewTop = heading.y;
  const viewBottom = heading.y + heading.height;
  const contribTop = frame.cropTop;
  const contribBottom = viewportHeight - frame.cropBottom;
  const top = Math.max(viewTop, contribTop);
  const bottom = Math.min(viewBottom, contribBottom);
  if (bottom - top <= 2) {
    return null;
  }
  return {
    height: heading.height,
    id: heading.id,
    stitchBottom: stitchOffset + (bottom - contribTop),
    stitchTop: stitchOffset + (top - contribTop),
  };
}

export function assertHeadingsOnce(
  appearances: ReadonlyArray<HeadingAppearance>,
  maxGap = 1,
): void {
  const byId = new Map<string, Array<HeadingAppearance>>();
  for (const item of appearances) {
    const list = byId.get(item.id) ?? [];
    list.push(item);
    byId.set(item.id, list);
  }
  for (const [id, list] of byId) {
    const ordered = list.toSorted((a, b) => a.stitchTop - b.stitchTop);
    const merged = [ordered[0]];
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = merged[merged.length - 1];
      const next = ordered[i];
      const gap = next.stitchTop - prev.stitchBottom;
      if (gap > maxGap) {
        throw new StitchSeamError(
          `heading "${id}" appears twice (gap ${gap}px between stitch ${prev.stitchBottom} and ${next.stitchTop})`,
        );
      }
      if (gap < -maxGap) {
        throw new StitchSeamError(
          `heading "${id}" overlaps itself in stitch space (${prev.stitchTop}-${prev.stitchBottom} vs ${next.stitchTop}-${next.stitchBottom})`,
        );
      }
      prev.stitchBottom = Math.max(prev.stitchBottom, next.stitchBottom);
    }
    if (merged.length !== 1) {
      throw new StitchSeamError(`heading "${id}" resolved to ${merged.length} stitch ranges`);
    }
  }
}

export function stitchOffsets(frames: ReadonlyArray<StitchFrame>): ReadonlyArray<number> {
  const offsets: Array<number> = [];
  let y = 0;
  for (const frame of frames) {
    offsets.push(y);
    y += frame.docBottom - frame.docTop;
  }
  return offsets;
}

/** Overlap between consecutive filmstrip viewports, below the sticky header. */
export const FILMSTRIP_HEADER_GAP_PX = 16;

/**
 * True viewport stops for a filmstrip. Step is `vh − headerBottom − 16` so
 * the band under the sticky header in frame n was fully visible in frame n−1.
 * Last stop is always page end.
 */
export function planFilmstripStops(
  scrollHeight: number,
  viewportHeight: number,
  headerBottom = 0,
): ReadonlyArray<number> {
  if (viewportHeight <= 0 || scrollHeight <= 0) {
    throw new StitchSeamError(`invalid metrics vh=${viewportHeight} sh=${scrollHeight}`);
  }
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  const step = Math.max(1, viewportHeight - Math.max(0, headerBottom) - FILMSTRIP_HEADER_GAP_PX);
  const stops = [0];
  for (let y = step; y < maxScroll - 1; y += step) {
    stops.push(y);
  }
  if (maxScroll > 0 && stops.at(-1) !== maxScroll) {
    stops.push(maxScroll);
  }
  return stops;
}

export type FilmstripHeadingDoc = {
  docY: number;
  height: number;
  sticky: boolean;
};

/**
 * The default stride can leave a title sitting in the 16px overlap. Insert a
 * stop that parks that title just below the header so the self-check can pass.
 */
export function ensureHeadingStops(
  stops: ReadonlyArray<number>,
  headings: ReadonlyArray<FilmstripHeadingDoc>,
  headerBottom: number,
  viewportHeight: number,
  maxScroll: number,
): ReadonlyArray<number> {
  const extra: Array<number> = [];
  for (const heading of headings) {
    if (heading.sticky || heading.height <= 0) {
      continue;
    }
    const ok = stops.some((scrollY) => {
      const y = heading.docY - scrollY;
      return y >= headerBottom && y + heading.height <= viewportHeight + 0.5;
    });
    if (!ok) {
      extra.push(Math.min(maxScroll, Math.max(0, Math.round(heading.docY - headerBottom))));
    }
  }
  return [...new Set([...stops, ...extra])].toSorted((a, b) => a - b);
}

export type FilmstripHeadingShot = {
  height: number;
  id: string;
  sticky: boolean;
  y: number;
};

/** True when the heading sits fully in the content band of this viewport. */
export function headingFullyClearOfChrome(
  heading: FilmstripHeadingShot,
  headerBottom: number,
  viewportHeight: number,
): boolean {
  if (heading.sticky) {
    return false;
  }
  return heading.y >= headerBottom && heading.y + heading.height <= viewportHeight + 0.5;
}

/**
 * Every content heading must be fully below the sticky header and above the
 * viewport bottom in at least one filmstrip stop.
 */
export function assertHeadingsClearOfChrome(
  shots: ReadonlyArray<FilmstripHeadingShot & { visible: boolean }>,
): void {
  const ids = new Set<string>();
  const seen = new Set<string>();
  for (const shot of shots) {
    if (shot.sticky) {
      continue;
    }
    ids.add(shot.id);
    if (shot.visible) {
      seen.add(shot.id);
    }
  }
  const missing = [...ids].filter((id) => !seen.has(id));
  if (missing.length > 0) {
    throw new StitchSeamError(
      `heading never fully clear of the header: ${missing.slice(0, 8).join(', ')}`,
    );
  }
}
