import {
  assertFrameAbutment,
  assertHeadingsClearOfChrome,
  assertHeadingsOnce,
  headingFullyClearOfChrome,
  headingInFrame,
  planFilmstripStops,
  planStitchFrames,
  realizeFrame,
  StitchSeamError,
  stitchOffsets,
} from '../greenhouseStitch';

describe('greenhouse stitch plan', () => {
  it('abuts frames and keeps the thicket on the last frame only', () => {
    const frames = planStitchFrames({
      fringeHeight: 109,
      headerHeight: 78,
      scrollHeight: 1673,
      viewportHeight: 900,
    });
    expect(frames.length).toBeGreaterThan(1);
    expect(frames.slice(0, -1).every((frame) => frame.cropBottom === 109)).toBe(true);
    expect(frames.at(-1)?.cropBottom).toBe(0);
    expect(frames[0]?.cropTop).toBe(0);
    expect(frames.slice(1).every((frame) => frame.cropTop > 0)).toBe(true);
    assertFrameAbutment(frames);
    expect(frames.at(-1)?.docBottom).toBeGreaterThanOrEqual(1673 - 1);
  });

  it('tiles a tall mobile page without a gap', () => {
    const frames = planStitchFrames({
      fringeHeight: 83,
      headerHeight: 105,
      scrollHeight: 3152,
      viewportHeight: 844,
    });
    assertFrameAbutment(frames);
    expect(frames.at(-1)?.cropBottom).toBe(0);
    expect(frames.at(-1)?.docBottom).toBeGreaterThanOrEqual(3152 - 1);
  });

  it('uses the actual scrollY, not the intended step', () => {
    const [first] = planStitchFrames({
      fringeHeight: 110,
      headerHeight: 78,
      scrollHeight: 1972,
      viewportHeight: 900,
    });
    const realized = realizeFrame(first, 0, 0, 900);
    expect(realized.cropTop).toBe(0);
    expect(realized.docBottom).toBe(900 - 110);
  });

  it('fails when consecutive crops overlap or gape', () => {
    expect(() =>
      assertFrameAbutment([
        { cropBottom: 0, cropTop: 0, docBottom: 800, docTop: 0, scrollY: 0 },
        { cropBottom: 0, cropTop: 0, docBottom: 1600, docTop: 790, scrollY: 790 },
      ]),
    ).toThrow(StitchSeamError);
  });

  it('fails when a heading lands in two stitch ranges', () => {
    const frameA = { cropBottom: 0, cropTop: 0, docBottom: 900, docTop: 0, scrollY: 0 };
    const frameB = { cropBottom: 0, cropTop: 0, docBottom: 1800, docTop: 900, scrollY: 900 };
    const heading = { height: 20, id: 'July 2026', sticky: false, width: 100, x: 20, y: 10 };
    const a = headingInFrame(heading, frameA, 0, 900);
    const b = headingInFrame({ ...heading, y: 10 }, frameB, 900, 900);
    expect(a && b).toBeTruthy();
    if (!a || !b) {
      throw new Error('expected both frames to see the heading');
    }
    expect(() => assertHeadingsOnce([a, b])).toThrow(/July 2026/);
  });

  it('accepts a heading split across an abutting crop', () => {
    const frames = planStitchFrames({
      fringeHeight: 100,
      headerHeight: 80,
      scrollHeight: 1800,
      viewportHeight: 900,
    });
    const offsets = stitchOffsets(frames);
    const first = frames[0];
    const splitY = first.docBottom - first.scrollY - 8;
    const heading = { height: 20, id: 'Cursor', sticky: false, width: 120, x: 40, y: splitY };
    const a = headingInFrame(heading, first, offsets[0], 900);
    const secondView = {
      ...heading,
      y: heading.y - (frames[1].scrollY - first.scrollY),
    };
    const b = headingInFrame(secondView, frames[1], offsets[1], 900);
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    if (!a || !b) {
      throw new Error('expected the heading to split across abutting frames');
    }
    expect(() => assertHeadingsOnce([a, b])).not.toThrow();
  });

  it('plans filmstrip stops with a header-overlap step, ending at page end', () => {
    expect(planFilmstripStops(1673, 900, 78)).toEqual([0, 773]);
    expect(planFilmstripStops(3152, 844, 105)).toEqual([0, 723, 1446, 2169, 2308]);
    expect(planFilmstripStops(1994, 900, 78)).toEqual([0, 806, 1094]);
    expect(planFilmstripStops(2620, 844, 105)).toEqual([0, 723, 1446, 1776]);
    expect(planFilmstripStops(800, 900, 78)).toEqual([0]);
  });

  it('requires each content heading to sit fully in the content band at some stop', () => {
    const title = { height: 24, id: 'INVISIBLE@400', sticky: false, y: 80 };
    expect(headingFullyClearOfChrome(title, 105, 844)).toBe(false);
    expect(headingFullyClearOfChrome({ ...title, y: 120 }, 105, 844)).toBe(true);
    expect(() =>
      assertHeadingsClearOfChrome([
        { ...title, visible: false },
        { ...title, visible: false, y: 10 },
      ]),
    ).toThrow(/INVISIBLE/);
    expect(() =>
      assertHeadingsClearOfChrome([
        { ...title, visible: false },
        { ...title, visible: true, y: 120 },
      ]),
    ).not.toThrow();
  });
});
