import { render, screen } from '@testing-library/react';
import { OrganicGrid } from '../OrganicGrid';

describe('OrganicGrid', () => {
  it('renders children inside the grid container', () => {
    render(
      <OrganicGrid>
        <div>Grid item</div>
      </OrganicGrid>,
    );

    const child = screen.getByText('Grid item');
    expect(child).toBeInTheDocument();

    const parent = child.parentElement;
    if (!parent) {
      throw new Error('Grid container not found');
    }

    expect(parent.tagName).toBe('DIV');
  });
});
