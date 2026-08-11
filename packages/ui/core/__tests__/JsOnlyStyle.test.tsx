import { render } from '@testing-library/react';
import { JsOnlyStyle, jsOnlyProps } from '../JsOnlyStyle';

describe('JsOnlyStyle', () => {
  it('hides script-only chrome from a noscript stylesheet', () => {
    const { container } = render(<JsOnlyStyle />);

    const noscript = container.querySelector('noscript');
    expect(noscript).not.toBeNull();

    const [attribute] = Object.keys(jsOnlyProps);
    expect(noscript?.textContent).toContain(`[${attribute}]`);
    expect(noscript?.textContent).toContain('display:none!important');
  });

  /**
   * The rule has to be a `<noscript>` stylesheet rather than a class some script
   * removes on boot: a browser with scripting on never parses this content, so
   * there is nothing to race, and a browser with it off applies the rule before
   * first paint instead of flashing a control it is about to take away.
   */
  it('ships the rule as a stylesheet, not a marker script has to clean up', () => {
    const { container } = render(<JsOnlyStyle />);

    expect(container.querySelector('noscript')?.textContent).toContain('<style>');
    expect(container.querySelector('script')).toBeNull();
  });

  it('marks chrome with an attribute that rule selects', () => {
    const [attribute, value] = Object.entries(jsOnlyProps)[0] ?? [];
    expect(attribute).toBe('data-js-only');
    expect(value).toBe(true);
  });
});
