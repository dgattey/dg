import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { GreenhouseGrid } from '../GreenhouseGrid';
import { GREENHOUSE_GRID_SPANS } from '../greenhouseGeometry';

describe('GreenhouseGrid', () => {
  it('renders children in one grid container', () => {
    render(
      <GreenhouseGrid>
        <div>Grid item</div>
      </GreenhouseGrid>,
    );

    const child = screen.getByText('Grid item');
    expect(child.parentElement?.tagName).toBe('DIV');
    expect(child.parentElement).toHaveAttribute('data-greenhouse-grid');
  });

  it('places the four home slots on a 12-col content-sized grid', () => {
    expect(GREENHOUSE_GRID_SPANS.intro).toEqual({ span: 8, start: 1 });
    expect(GREENHOUSE_GRID_SPANS['now-playing']).toEqual({ span: 4, start: 9 });
    expect(GREENHOUSE_GRID_SPANS.activity).toEqual({ span: 7, start: 1 });
    expect(GREENHOUSE_GRID_SPANS.featured).toEqual({ span: 5, start: 8 });
    const source = readFileSync(join(__dirname, '../GreenhouseGrid.tsx'), 'utf8');
    expect(source).toContain('repeat(12, minmax(0, 1fr))');
    expect(source).toContain("gridAutoRows: 'auto'");
    expect(source).toContain('75cqi');
    expect(source).toContain('160cqi');
  });
});
