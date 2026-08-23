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

    const titles = screen.getAllByText('Everything In Its Right Place');
    expect(titles).toHaveLength(3);
    expect(titles[0]).toHaveClass('MuiTypography-h3');
    expect(titles[1]).toHaveClass('MuiTypography-h4');
    expect(titles[2]).toHaveClass('MuiTypography-h5');

    const css = titles.map((title) => rulesFor(title)).join('\n');
    expect(css).toContain('-webkit-line-clamp: 2');
    expect(css).toContain('overflow-wrap: anywhere');
    expect(css).toContain('@container now-playing (max-width: 22.5rem)');
    expect(css).toContain('@container now-playing (min-width: 12rem) and (max-width: 22.5rem)');
    expect(css).toContain('@container now-playing (max-width: 12rem)');
    expect(css).not.toContain('-webkit-line-clamp: 1');
  });

  it('adds an h2 step for the hero layout above 30rem', () => {
    render(
      <TrackTitle
        layout="hero"
        listingVariant="nowPlaying"
        trackTitle="Everything In Its Right Place"
      />,
    );

    const titles = screen.getAllByText('Everything In Its Right Place');
    expect(titles).toHaveLength(4);
    expect(titles[0]).toHaveClass('MuiTypography-h2');
    expect(titles[1]).toHaveClass('MuiTypography-h3');
    expect(titles[2]).toHaveClass('MuiTypography-h4');
    expect(titles[3]).toHaveClass('MuiTypography-h5');

    const css = titles.map((title) => rulesFor(title)).join('\n');
    expect(css).toContain('@container now-playing (min-width: 30rem)');
    expect(css).toContain('-webkit-line-clamp: 2');
  });
});
