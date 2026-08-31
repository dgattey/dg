import { invariant } from '@dg/shared-core/assertions/invariant';
import { render } from '@testing-library/react';
import { CutOut } from '../CutOut';
import { CutOutSymbols } from '../CutOutSymbols';
import {
  ALL_CUT_OUT_PLACEMENTS,
  CUT_OUT_PLACEMENTS,
  type CutOutPlacement,
} from '../cutOutPlacements';
import { CUT_OUT_SHAPE_NAMES, CUT_OUT_SHAPES, cutOutSymbolId } from '../cutOutShapes';

function testPlacement(
  overrides: Partial<CutOutPlacement> & Pick<CutOutPlacement, 'sizePx'>,
): CutOutPlacement {
  return {
    color: 'star',
    id: 'test-cut-out',
    rotationDeg: 0,
    shape: 'star5',
    visibility: 'all',
    xPercent: 0,
    yPercent: 0,
    zIndex: 1,
    ...overrides,
  };
}

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

  it('keeps dark-desktop cut-outs as small moon or star decorations', () => {
    const darkDesktopPlacements = ALL_CUT_OUT_PLACEMENTS.filter(
      (placement) => placement.visibility === 'dark-desktop',
    );
    expect(darkDesktopPlacements.length).toBeGreaterThan(0);
    for (const placement of darkDesktopPlacements) {
      expect(['moon', 'star4', 'star5']).toContain(placement.shape);
      expect(placement.sizePx).toBeLessThan(120);
      const { container, unmount } = render(<CutOut placement={placement} />);
      const cutOut = container.querySelector('svg');
      invariant(cutOut, 'Expected a rendered cut-out');
      expect(cutOut).toHaveClass('cutNightOnly');
      expect(cutOut).toHaveClass('cutDesktopOnly');
      unmount();
    }
  });

  it('assigns parallax depth classes to cut-outs at least 120px wide', () => {
    const cases: Array<{ placement: CutOutPlacement; depthClass?: string }> = [
      { placement: testPlacement({ sizePx: 119 }) },
      { depthClass: 'cutDepthFast', placement: testPlacement({ sizePx: 120 }) },
      { depthClass: 'cutDepthFast', placement: testPlacement({ sizePx: 319 }) },
      { depthClass: 'cutDepthMedium', placement: testPlacement({ sizePx: 320 }) },
    ];

    for (const { placement, depthClass } of cases) {
      const { container, unmount } = render(<CutOut placement={placement} />);
      const cutOut = container.querySelector('svg');
      invariant(cutOut, 'Expected a rendered cut-out');
      expect(cutOut).toHaveClass('cutOut');
      if (depthClass) {
        expect(cutOut).toHaveClass(depthClass);
      } else {
        expect(cutOut).not.toHaveClass('cutDepthMedium');
        expect(cutOut).not.toHaveClass('cutDepthFast');
      }
      unmount();
    }
  });
});
