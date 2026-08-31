import { invariant } from '@dg/shared-core/assertions/invariant';
import { render } from '@testing-library/react';
import { CutOut } from '../CutOut';
import { CutOutSymbols } from '../CutOutSymbols';
import { ALL_CUT_OUT_PLACEMENTS, CUT_OUT_PLACEMENTS } from '../cutOutPlacements';
import { CUT_OUT_SHAPE_NAMES, CUT_OUT_SHAPES, cutOutSymbolId } from '../cutOutShapes';

describe('collage cut-outs', () => {
  it('keeps symbols, unique ids, and finite placement geometry in sync', () => {
    render(<CutOutSymbols />);
    const shapes = new Set(ALL_CUT_OUT_PLACEMENTS.map((placement) => placement.shape));
    expect(shapes).toEqual(new Set(CUT_OUT_SHAPE_NAMES));
    for (const shape of shapes) {
      expect(document.getElementById(cutOutSymbolId(shape))).not.toBeNull();
      expect(CUT_OUT_SHAPES[shape].length).toBeGreaterThan(0);
    }
    expect(new Set(ALL_CUT_OUT_PLACEMENTS.map((placement) => placement.id)).size).toBe(
      ALL_CUT_OUT_PLACEMENTS.length,
    );
    for (const placement of ALL_CUT_OUT_PLACEMENTS) {
      expect(
        [
          placement.sizePx,
          placement.xPercent,
          placement.yPercent,
          placement.rotationDeg,
          placement.zIndex,
        ].every(Number.isFinite),
      ).toBe(true);
    }
  });

  it('keeps rendered decorations out of the accessibility tree', () => {
    const placement = CUT_OUT_PLACEMENTS.helloSheet[0];
    invariant(placement, 'Expected a Hello sheet placement');
    const { container } = render(<CutOut placement={placement} />);
    const cutOut = container.querySelector('svg');
    expect(cutOut).toHaveAttribute('aria-hidden', 'true');
    expect(cutOut).toHaveAttribute('focusable', 'false');
  });
});
