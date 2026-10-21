import { renderToStaticMarkup } from 'react-dom/server';
import { JsOnlyStyle, jsOnlyProps } from '../JsOnlyStyle';

describe('JsOnlyStyle', () => {
  /**
   * The rule has to be a `<noscript>` stylesheet rather than a class some script
   * removes on boot: a browser with scripting on never parses this content, so
   * there is nothing to race, and a browser with it off applies the rule before
   * first paint instead of flashing a control it is about to take away.
   */
  it('ships a noscript stylesheet that hides script-only chrome', () => {
    const [attribute] = Object.keys(jsOnlyProps);
    expect(renderToStaticMarkup(<JsOnlyStyle />)).toBe(
      `<noscript><style>[${attribute}]{display:none!important}</style></noscript>`,
    );
  });

  it('marks chrome with an attribute that rule selects', () => {
    const [attribute, value] = Object.entries(jsOnlyProps)[0] ?? [];
    expect(attribute).toBe('data-js-only');
    expect(value).toBe(true);
  });
});
