import { render } from '@testing-library/react';
import { ForestMinimap } from '../ForestMinimap';
import { buildForestWorld } from '../forestMap';

describe('ForestMinimap', () => {
  it('pins the chart to the visual viewport in the bottom-right', () => {
    const world = buildForestWorld(['intro', 'map']);
    const { container } = render(<ForestMinimap world={world} />);
    const chart = container.querySelector('[data-forest-minimap]');
    expect(chart).not.toBeNull();
    const css = [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules].map((rule) => rule.cssText);
        } catch {
          return [];
        }
      })
      .join('\n');
    expect(css).toMatch(/position:\s*fixed/);
    expect(css).toMatch(/bottom:\s*16px/);
    expect(css).toMatch(/right:\s*16px/);
  });
});
