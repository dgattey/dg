import { renderToString } from 'react-dom/server';
import { RouteMap } from '../RouteMap';
import type { RouteFrame } from '../routeFrame';

const frame: RouteFrame = { center: [37.77, -122.42], height: 320, width: 420, zoom: 11 };

const serverMarkup = () =>
  renderToString(
    <RouteMap
      frame={frame}
      paths={[{ d: 'M0 0L10 10', tone: 'cobalt' }]}
      strokeWidth={2}
      tileSource={{ apiKey: null, mode: 'stadia' }}
    />,
  );

const tileImgs = (html: string, style: string) =>
  html.match(new RegExp(`<img[^>]*tiles/${style}/[^>]*>`, 'g')) ?? [];

describe('RouteMap', () => {
  it('ships both basemaps in server markup so CSS can paint the right one before hydration', () => {
    const html = serverMarkup();

    expect(tileImgs(html, 'outdoors').length).toBeGreaterThan(0);
    expect(tileImgs(html, 'alidade_smooth_dark').length).toBeGreaterThan(0);
  });

  it('lazy-loads every tile so the hidden scheme never downloads', () => {
    const html = serverMarkup();

    for (const img of [...tileImgs(html, 'outdoors'), ...tileImgs(html, 'alidade_smooth_dark')]) {
      expect(img).toContain('loading="lazy"');
    }
  });

  it('positions tiles in card-relative percentages so rotated cards and all breakpoints render without ResizeObserver reflow', () => {
    const html = serverMarkup();

    expect(html).toMatch(/--tile-h:\d+\.\d{4}%/);
    expect(html).toMatch(/--tile-w:\d+\.\d{4}%/);
    expect(html).toMatch(/--tile-left:-?\d+\.\d{4}%/);
    expect(html).toMatch(/--tile-top:-?\d+\.\d{4}%/);
  });
});
