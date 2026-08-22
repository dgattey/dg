import { render, screen } from '@testing-library/react';
import { GreenhouseGrid } from '../GreenhouseGrid';

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
});
