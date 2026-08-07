import { render, screen } from '@testing-library/react';
import { StickyFadeBar } from '../StickyFadeBar';

describe('StickyFadeBar', () => {
  it('reserves only the perceptible part of its fade', () => {
    const { container } = render(
      <StickyFadeBar data-testid="bar">
        <span>July 2026</span>
      </StickyFadeBar>,
    );

    expect(screen.getByTestId('bar')).toHaveStyle({ paddingBlockEnd: '1.375rem' });
    expect(container.querySelector('[data-sticky-fade]')).toHaveStyle({
      bottom: 'calc(-1 * (3rem - 1.375rem))',
      height: '3rem',
    });
    expect(container.querySelector('[data-sticky-surface]')).toHaveStyle({
      bottom: 'calc(1.375rem - 1px)',
    });
  });
});
