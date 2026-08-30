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

  it('keeps its chrome painted through an album open or close', () => {
    const { container } = render(
      <StickyFadeBar>
        <span>July 2026</span>
      </StickyFadeBar>,
    );

    const surface = container.querySelector('[data-sticky-surface]') as HTMLElement;
    const rules = [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules].map((rule) => rule.cssText);
        } catch {
          return [];
        }
      })
      .filter((rule) => [...surface.classList].some((name) => rule.includes(`.${name}`)))
      .join('\n');

    const hiding = rules.split('\n').filter((rule) => /opacity:\s*0/.test(rule));

    // A navigation still hides the band it would otherwise sweep across content.
    expect(hiding.join('\n')).toContain('html:active-view-transition');
    // An album open/close does not, so no artwork shows through the pinned bar.
    expect(hiding.join('\n')).toContain(':not(:active-view-transition-type(album-open))');
    expect(hiding.join('\n')).toContain(':not(:active-view-transition-type(album-close))');
  });
});
