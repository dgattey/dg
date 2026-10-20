import { render, screen } from '@testing-library/react';
import { StickyFadeBar } from '../StickyFadeBar';

describe('StickyFadeBar', () => {
  it('pins to the header height offset', () => {
    render(
      <StickyFadeBar data-testid="bar">
        <span>July 2026</span>
      </StickyFadeBar>,
    );

    expect(screen.getByTestId('bar')).toHaveStyle({
      position: 'sticky',
      top: 'var(--site-header-height, 5.5rem)',
      zIndex: '5',
    });
  });
});
