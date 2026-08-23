import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertFrameAbutment,
  assertHeadingsClearOfChrome,
  assertHeadingsOnce,
  ensureHeadingStops,
  headingFullyClearOfChrome,
  headingInFrame,
  planFilmstripStops,
  planStitchFrames,
  realizeFrame,
  StitchSeamError,
  stitchOffsets,
} from '../greenhouse-filmstrip';

describe('greenhouse stitch plan', () => {
  it('abuts frames and keeps the thicket on the last frame only', () => {
    const frames = planStitchFrames({
      fringeHeight: 109,
      headerHeight: 78,
      scrollHeight: 1673,
      viewportHeight: 900,
    });
    const first = frames[0];
    const last = frames.at(-1);
    assert.ok(first);
    assert.ok(last);
    assert.ok(frames.length > 1);
    assert.ok(frames.slice(0, -1).every((frame) => frame.cropBottom === 109));
    assert.equal(last.cropBottom, 0);
    assert.equal(first.cropTop, 0);
    assert.ok(frames.slice(1).every((frame) => frame.cropTop > 0));
    assertFrameAbutment(frames);
    assert.ok(last.docBottom >= 1673 - 1);
  });

  it('tiles a tall mobile page without a gap', () => {
    const frames = planStitchFrames({
      fringeHeight: 83,
      headerHeight: 105,
      scrollHeight: 3152,
      viewportHeight: 844,
    });
    const last = frames.at(-1);
    assert.ok(last);
    assertFrameAbutment(frames);
    assert.equal(last.cropBottom, 0);
    assert.ok(last.docBottom >= 3152 - 1);
  });

  it('uses the actual scrollY, not the intended step', () => {
    const frames = planStitchFrames({
      fringeHeight: 110,
      headerHeight: 78,
      scrollHeight: 1972,
      viewportHeight: 900,
    });
    const first = frames[0];
    assert.ok(first);
    const realized = realizeFrame(first, 0, 0, 900);
    assert.equal(realized.cropTop, 0);
    assert.equal(realized.docBottom, 900 - 110);
  });

  it('fails when consecutive crops overlap or gape', () => {
    assert.throws(
      () =>
        assertFrameAbutment([
          { cropBottom: 0, cropTop: 0, docBottom: 800, docTop: 0, scrollY: 0 },
          { cropBottom: 0, cropTop: 0, docBottom: 1600, docTop: 790, scrollY: 790 },
        ]),
      StitchSeamError,
    );
  });

  it('fails when a heading lands in two stitch ranges', () => {
    const frameA = { cropBottom: 0, cropTop: 0, docBottom: 900, docTop: 0, scrollY: 0 };
    const frameB = { cropBottom: 0, cropTop: 0, docBottom: 1800, docTop: 900, scrollY: 900 };
    const heading = { height: 20, id: 'July 2026', sticky: false, width: 100, x: 20, y: 10 };
    const a = headingInFrame(heading, frameA, 0, 900);
    const b = headingInFrame({ ...heading, y: 10 }, frameB, 900, 900);
    assert.ok(a && b);
    assert.throws(() => assertHeadingsOnce([a, b]), /July 2026/);
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
    const second = frames[1];
    const firstOffset = offsets[0];
    const secondOffset = offsets[1];
    assert.ok(first);
    assert.ok(second);
    assert.equal(typeof firstOffset, 'number');
    assert.equal(typeof secondOffset, 'number');
    if (typeof firstOffset !== 'number' || typeof secondOffset !== 'number') {
      throw new Error('expected stitch offsets for both frames');
    }
    const splitY = first.docBottom - first.scrollY - 8;
    const heading = { height: 20, id: 'Cursor', sticky: false, width: 120, x: 40, y: splitY };
    const a = headingInFrame(heading, first, firstOffset, 900);
    const secondView = {
      ...heading,
      y: heading.y - (second.scrollY - first.scrollY),
    };
    const b = headingInFrame(secondView, second, secondOffset, 900);
    assert.ok(a);
    assert.ok(b);
    assert.doesNotThrow(() => assertHeadingsOnce([a, b]));
  });

  it('plans filmstrip stops with a header-overlap step, ending at page end', () => {
    assert.deepEqual(planFilmstripStops(1673, 900, 78), [0, 773]);
    assert.deepEqual(planFilmstripStops(3152, 844, 105), [0, 723, 1446, 2308]);
    assert.deepEqual(planFilmstripStops(1994, 900, 78), [0, 1094]);
    assert.deepEqual(planFilmstripStops(2620, 844, 105), [0, 723, 1776]);
    assert.deepEqual(planFilmstripStops(800, 900, 78), [0]);
  });

  it('requires each content heading to sit fully in the content band at some stop', () => {
    const title = { height: 24, id: 'INVISIBLE@400', sticky: false, y: 80 };
    assert.equal(headingFullyClearOfChrome(title, 105, 844), false);
    assert.equal(headingFullyClearOfChrome({ ...title, y: 120 }, 105, 844), true);
    assert.throws(
      () =>
        assertHeadingsClearOfChrome([
          { ...title, visible: false },
          { ...title, visible: false, y: 10 },
        ]),
      /INVISIBLE/,
    );
    assert.doesNotThrow(() =>
      assertHeadingsClearOfChrome([
        { ...title, visible: false },
        { ...title, visible: true, y: 120 },
      ]),
    );
  });

  it('replaces the next stride with a title park and continues from it', () => {
    const stops = planFilmstripStops(1994, 900, 78);
    assert.deepEqual(stops, [0, 1094]);
    const patched = ensureHeadingStops(
      stops,
      [{ docY: 859, height: 46, sticky: false }],
      78,
      900,
      1094,
    );
    assert.deepEqual(patched, [0, 781, 1094]);
  });

  it('drops the previous stop when page end is within 40% of the viewport', () => {
    assert.deepEqual(planFilmstripStops(3152, 844, 105), [0, 723, 1446, 2308]);
  });

  it('does not steal a working stride when titles already clear', () => {
    assert.deepEqual(
      planFilmstripStops(3152, 844, 105, [
        { docY: 850, height: 54, sticky: false },
        { docY: 920, height: 24, sticky: false },
      ]),
      [0, 723, 1446, 2308],
    );
  });

  it('nudges a too-close regular stop instead of pairing it with page end', () => {
    assert.deepEqual(
      planFilmstripStops(2620, 844, 105, [{ docY: 1629, height: 48, sticky: false }]),
      [0, 723, 1438, 1776],
    );
  });
});
