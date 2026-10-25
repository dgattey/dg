import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { RouteMap } from '../RouteMap';
import type { RouteFrame } from '../routeFrame';

const mapsCss = readFileSync(path.join(__dirname, '../../maps.css'), 'utf8');

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

  it('locks pigeon-maps container size to 100% so rotated cards never trigger a ResizeObserver zoom loop', () => {
    const html = serverMarkup();

    expect(html).toContain('<div data-map-tile-layer=""><div style="width:100%;height:100%;');
    expect(html).not.toContain('<div data-map-tile-layer=""><div style="width:420px;height:320px;');

    const tileLayerDivBlock =
      mapsCss.match(/\[data-map-tile-layer\]\s*>\s*div\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(tileLayerDivBlock).toContain('width: 100% !important;');
    expect(tileLayerDivBlock).toContain('height: 100% !important;');
    expect(tileLayerDivBlock).toContain('background-color: transparent !important;');

    const atlasTilesDivBlock =
      mapsCss.match(/\[data-atlas-tiles\]\s*>\s*div\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(atlasTilesDivBlock).toContain('background-color: transparent !important;');
  });
});
