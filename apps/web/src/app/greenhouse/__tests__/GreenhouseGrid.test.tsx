import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { GreenhouseGrid } from '../GreenhouseGrid';
import { GREENHOUSE_GRID_SPANS } from '../greenhouseGeometry';

jest.mock('../greenhouse.module.css', () => ({
  cell: 'cell',
  grid: 'grid',
  nowPlaying: 'nowPlaying',
}));

describe('GreenhouseGrid', () => {
  it('renders children in one grid container', () => {
    render(
      <GreenhouseGrid>
        <div>Grid item</div>
      </GreenhouseGrid>,
    );

    const child = screen.getByText('Grid item');
    expect(child.parentElement).toHaveAttribute('data-greenhouse-cell', 'intro');
    expect(child.parentElement?.parentElement).toHaveAttribute('data-greenhouse-grid');
  });

  it('places the four home slots on a 12-col content-sized grid', () => {
    expect(GREENHOUSE_GRID_SPANS.intro).toEqual({ span: 8, start: 1 });
    expect(GREENHOUSE_GRID_SPANS['now-playing']).toEqual({ span: 4, start: 9 });
    expect(GREENHOUSE_GRID_SPANS.activity).toEqual({ span: 7, start: 1 });
    expect(GREENHOUSE_GRID_SPANS.featured).toEqual({ span: 5, start: 8 });
    const source = readFileSync(join(__dirname, '../GreenhouseGrid.tsx'), 'utf8');
    const css = readFileSync(join(__dirname, '../greenhouse.module.css'), 'utf8');
    expect(source).toContain('GREENHOUSE_GRID_SPANS[slot].span');
    expect(source).toContain('GREENHOUSE_STACKED_SPANS');
    expect(source).toContain('md: stackedSpan(slot)');
    expect(css).toContain('repeat(12, minmax(0, 1fr))');
    expect(css).toContain('min-width: 768px');
    expect(css).toContain('grid-auto-rows: auto');
    expect(css).toContain('container-type: inline-size');
    expect(css).toContain('75cqi');
    expect(css).toContain('160cqi');
  });

  it('flows leftover cells at span 4 on desktop and span 6 on tablet', () => {
    render(
      <GreenhouseGrid>
        <div>intro</div>
        <div>now</div>
        <div>activity</div>
        <div>featured</div>
        <div>extra-a</div>
        <div>extra-b</div>
      </GreenhouseGrid>,
    );

    expect(screen.getByText('extra-a').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'more-4',
    );
    expect(screen.getByText('extra-b').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'more-5',
    );
    const source = readFileSync(join(__dirname, '../GreenhouseGrid.tsx'), 'utf8');
    expect(source).toContain("xl: 'span 4'");
    expect(source).toContain("md: 'span 6'");
    expect(source).toContain("span ${GREENHOUSE_GRID_SPANS[slot].span}");
  });
});
