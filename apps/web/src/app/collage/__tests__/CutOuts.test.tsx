/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { CutOut } from '../CutOut';
import { CutOutSymbols } from '../CutOutSymbols';
import { ALL_CUT_OUT_PLACEMENTS, CUT_OUT_PLACEMENTS } from '../cutOutPlacements';
import { CUT_OUT_SHAPE_NAMES, CUT_OUT_SHAPES, cutOutSymbolId } from '../cutOutShapes';

describe('collage cut-outs', () => {
  it('defines every symbol referenced by a placement', () => {
    render(<CutOutSymbols />);

    const referencedShapes = new Set(ALL_CUT_OUT_PLACEMENTS.map((placement) => placement.shape));
    expect(referencedShapes).toEqual(new Set(CUT_OUT_SHAPE_NAMES));

    for (const shape of referencedShapes) {
      const symbol = document.getElementById(cutOutSymbolId(shape));
      expect(symbol).not.toBeNull();
      expect(CUT_OUT_SHAPES[shape].length).toBeGreaterThan(0);
    }
  });

  it('keeps source placements finite, uniquely named, and within their drawing bounds', () => {
    expect(CUT_OUT_PLACEMENTS.helloSheet).toHaveLength(14);
    expect(CUT_OUT_PLACEMENTS.portrait).toHaveLength(2);
    expect(new Set(ALL_CUT_OUT_PLACEMENTS.map((placement) => placement.id)).size).toBe(
      ALL_CUT_OUT_PLACEMENTS.length,
    );

    for (const placement of ALL_CUT_OUT_PLACEMENTS) {
      expect(placement.sizePx).toBeGreaterThan(0);
      expect(placement.xPercent).toBeGreaterThanOrEqual(-100);
      expect(placement.xPercent).toBeLessThanOrEqual(100);
      expect(placement.yPercent).toBeGreaterThanOrEqual(-100);
      expect(placement.yPercent).toBeLessThanOrEqual(100);
      expect(placement.rotationDeg).toBeGreaterThanOrEqual(-180);
      expect(placement.rotationDeg).toBeLessThanOrEqual(180);
      expect([0, 1, 3]).toContain(placement.zIndex);

      if (placement.underprint) {
        expect(placement.underprint.offset.every(Number.isFinite)).toBe(true);
      }
    }
  });

  it('keeps rendered decorations out of the accessibility tree', () => {
    const placement = CUT_OUT_PLACEMENTS.helloSheet[0];
    if (!placement) {
      throw new Error('Expected the Hello sheet placement registry to be populated');
    }

    const { container } = render(<CutOut placement={placement} />);
    const cutOut = container.querySelector('svg');

    expect(cutOut).toHaveAttribute('aria-hidden', 'true');
    expect(cutOut).toHaveAttribute('focusable', 'false');
  });
});
