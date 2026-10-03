/**
 * @jest-environment jsdom
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { render } from '@testing-library/react';
import { CutOut } from '../CutOut';
import { CutOutSymbols } from '../CutOutSymbols';
import { ALL_CUT_OUT_PLACEMENTS, CUT_OUT_PLACEMENTS } from '../cutOutPlacements';
import { CUT_OUT_SHAPE_NAMES, CUT_OUT_SHAPES, cutOutSymbolId } from '../cutOutShapes';

const WEB_SRC_DIR = path.join(__dirname, '../../..');

function stylesheetsAssigning(property: string): Array<string> {
  const declaration = new RegExp(`${property}\\s*:`);
  return readdirSync(WEB_SRC_DIR, { encoding: 'utf8', recursive: true })
    .filter((file) => file.endsWith('.css'))
    .filter((file) => declaration.test(readFileSync(path.join(WEB_SRC_DIR, file), 'utf8')))
    .map((file) => `${file} sets ${property}`);
}

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

  it('keeps source placements finite and uniquely named', () => {
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

  it('mirrors placements that request it', () => {
    const mirrored = CUT_OUT_PLACEMENTS.workSheet.find((placement) => placement.mirrored);
    invariant(mirrored, 'Expected a mirrored Work sheet cut-out');

    const { container } = render(<CutOut placement={mirrored} />);
    const cutOut = container.querySelector('svg');
    expect(cutOut).toHaveStyle({ '--cut-scale-x': '-1' });
  });

  it('keeps rendered decorations out of the accessibility tree', () => {
    const placement = CUT_OUT_PLACEMENTS.helloSheet[0];
    invariant(placement, 'Expected a Hello sheet placement');

    const { container } = render(<CutOut placement={placement} />);
    const cutOut = container.querySelector('svg');

    expect(cutOut).toHaveAttribute('aria-hidden', 'true');
    expect(cutOut).toHaveAttribute('focusable', 'false');
  });

  it('keeps stylesheets from restating geometry that cut-outs set inline, where it can never win', () => {
    const placement = CUT_OUT_PLACEMENTS.helloSheet[0];
    invariant(placement, 'Expected a Hello sheet placement');
    const { container } = render(<CutOut placement={placement} />);
    const inlineStyle = container.querySelector('svg')?.getAttribute('style') ?? '';
    const inlineProperties = Array.from(
      inlineStyle.matchAll(/(--[\w-]+)\s*:/g),
      ([, name = '']) => name,
    );
    expect(inlineProperties).toEqual(expect.arrayContaining(['--cut-size', '--cut-x', '--cut-y']));
    expect(inlineProperties.flatMap(stylesheetsAssigning)).toEqual([]);
  });
});
