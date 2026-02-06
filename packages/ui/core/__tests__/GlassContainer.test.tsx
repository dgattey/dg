import { render, screen } from '@testing-library/react';
import { GlassContainer } from '../GlassContainer';

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
});
