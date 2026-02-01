import { render, screen } from '@testing-library/react';
import { GlassContainer, GlassContainerDefs } from '../GlassContainer';

describe('GlassContainer', () => {
  it('renders children', () => {
    render(
      <GlassContainer data-testid="glass">
        <span>Inside</span>
      </GlassContainer>,
    );

    expect(screen.getByText('Inside')).toBeInTheDocument();
    expect(screen.getByTestId('glass')).toBeInTheDocument();
  });

  it('renders SVG filter defs', () => {
    const { container } = render(<GlassContainerDefs />);
    const filter = container.querySelector('filter#glass-displacement-filter');

    expect(filter).not.toBeNull();
  });
});
