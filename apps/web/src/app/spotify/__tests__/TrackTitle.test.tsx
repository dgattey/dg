import { render, screen } from '@testing-library/react';
import { TrackTitle } from '../TrackTitle';

function rulesFor(element: Element): string {
  return [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter((rule) => [...element.classList].some((className) => rule.includes(`.${className}`)))
    .join('\n');
}

describe('TrackTitle', () => {
  it('keeps flag-off card titles on a single ellipsized line', () => {
    render(<TrackTitle listingVariant="card" trackTitle="INVISIBLE" />);

    const title = screen.getByText('INVISIBLE');
    const css = rulesFor(title);
    expect(title).toHaveStyle({ display: '-webkit-box', overflow: 'hidden' });
    expect(css).toContain('-webkit-line-clamp: 1');
    expect(css).not.toContain('overflow-wrap: anywhere');
  });

  it('wraps greenhouse titles to two lines anywhere instead of ellipsizing', () => {
    render(<TrackTitle listingVariant="nowPlaying" trackTitle="Everything In Its Right Place" />);

    const title = screen.getByText('Everything In Its Right Place');
    const css = rulesFor(title);
    expect(title).toHaveStyle({ display: '-webkit-box', overflow: 'hidden' });
    expect(css).toContain('-webkit-line-clamp: 2');
    expect(css).toContain('overflow-wrap: anywhere');
    expect(css).not.toContain('-webkit-line-clamp: 1');
  });
});
