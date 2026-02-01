import { render, screen } from '@testing-library/react';
import { ContentGrid } from '../ContentGrid';

describe('ContentGrid', () => {
  it('renders children inside the grid container', () => {
    render(
      <ContentGrid>
        <div>Grid item</div>
      </ContentGrid>,
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
