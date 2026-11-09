/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { VisibleRoutes } from '../../VisibleRoutes';
import { RouteAtlasMap } from '../RouteAtlasMap';
import type { GeoBounds, MapRoute } from '../routeFrame';
import { encodePolyline } from '../routeGeometry';

const BOUNDS: GeoBounds = [
  [37.7, -122.5],
  [37.82, -122.38],
];

const ROUTES: ReadonlyArray<MapRoute> = [
  {
    id: 1,
    polyline: encodePolyline([
      [37.76, -122.45],
      [37.78, -122.41],
    ]),
    tone: 'cobalt',
  },
  {
    id: 2,
    polyline: encodePolyline([
      [37.76, -122.43],
      [37.77, -122.42],
    ]),
    tone: 'vermilion',
  },
];

describe('RouteAtlasMap', () => {
  it('renders offline tiles, single combined SSR route path, canvas layer, and zoom controls', () => {
    const html = renderToString(
      <RouteAtlasMap
        bounds={BOUNDS}
        label="Route atlas"
        routes={ROUTES}
        tileSource={{ mode: 'offline' }}
      />,
    );

    expect(html).toContain('aria-label="Route atlas"');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain('data-atlas-canvas=""');
    expect(html).toContain('data-atlas-ssr=""');
    expect(html).toContain('viewBox="0 0 390 470"');
    expect(
      html.match(/<svg[^>]*data-atlas-ssr=""[\s\S]*?<\/svg>/)?.[0].match(/<path/g),
    ).toHaveLength(1);
    expect(html).toContain('data-tones="cobalt,vermilion"');
    expect(html).toMatch(/src="\/tiles\/outdoors\/\d+\/\d+\/\d+\.png"/);
    expect(html).toContain('data-atlas-tile-stage=""');
    expect(html).toMatch(
      /--box-transform:translate3d\(-?\d+\.\d{4}%, -?\d+\.\d{4}%, 0px\) scale\(\d+\.\d{6}, \d+\.\d{6}\)/,
    );
  });

  it('renders Stadia tiles, filtered route tones, and zoom controls when online', () => {
    const html = renderToString(
      <VisibleRoutes value={new Set([1])}>
        <RouteAtlasMap
          bounds={BOUNDS}
          label="Route atlas"
          routes={ROUTES}
          tileSource={{ mode: 'stadia' }}
        />
      </VisibleRoutes>,
    );

    expect(html).toContain('aria-label="Route atlas"');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Reset view"');
    expect(html).toContain('tiles/outdoors/');
    expect(html).toContain('data-tones="cobalt"');
    expect(html).not.toContain('vermilion');
    expect(html).toMatch(
      /data-transform="translate\(-?\d+\.\d{2} -?\d+\.\d{2}\) scale\(\d+\.\d{6}\)"/,
    );
  });
});

const tileZoom = (map: HTMLElement) =>
  Number(/\/tiles\/[^/]+\/(\d+)\//.exec(map.querySelector('img')?.getAttribute('src') ?? '')?.[1]);

describe('RouteAtlasMap zoom', () => {
  beforeEach(() => {
    HTMLImageElement.prototype.decode = () => Promise.resolve();
  });

  it('keeps the tile layer moving with the routes until the zoomed tiles replace it', async () => {
    const user = userEvent.setup();
    render(
      <RouteAtlasMap
        bounds={BOUNDS}
        label="Route atlas"
        routes={ROUTES}
        tileSource={{ mode: 'offline' }}
      />,
    );
    const map = screen.getByLabelText('Route atlas');
    const layer = map.querySelector<HTMLElement>('[data-atlas-tiles]');
    const startZoom = tileZoom(map);
    const records: Array<MutationRecord> = [];
    const observer = new MutationObserver((batch) => records.push(...batch));
    observer.observe(map, {
      attributeFilter: ['src', 'srcset', 'style'],
      attributeOldValue: true,
      childList: true,
      subtree: true,
    });

    await user.click(screen.getByLabelText('Zoom in'));
    await waitFor(() => expect(tileZoom(map)).toBe(startZoom + 1));
    await waitFor(() => expect(layer?.style.transform).toBe(''));
    observer.disconnect();

    // Browsers keep painting an <img>'s previous picture until its new src loads,
    // so an img switching tiles shows the wrong tile in the new slot.
    const imgRecords = records.filter(
      (r) => r.type === 'attributes' && r.attributeName !== 'style',
    );
    const valueAfter = (r: MutationRecord, i: number) => {
      const later = imgRecords
        .slice(i + 1)
        .find((n) => n.target === r.target && n.attributeName === r.attributeName);
      if (later) return later.oldValue;
      return r.target instanceof Element ? r.target.getAttribute(r.attributeName ?? '') : null;
    };
    const retargets = imgRecords.filter(
      (r, i) => r.oldValue !== null && r.oldValue !== valueAfter(r, i),
    );
    const retargeted = retargets.map(
      (r) => `${r.oldValue} -> ${valueAfter(r, imgRecords.indexOf(r))}`,
    );
    expect(retargeted).toEqual([]);

    const layerStyles = records.filter((r) => r.target === layer && r.attributeName === 'style');
    const layerValueAfter = (r: MutationRecord) =>
      layerStyles[layerStyles.indexOf(r) + 1]?.oldValue ?? layer?.getAttribute('style') ?? '';
    const firstTileSwap = records.findIndex((r) => r.type === 'childList' || retargets.includes(r));
    const firstUntransformed = records.findIndex(
      (r) => layerStyles.includes(r) && !layerValueAfter(r).includes('transform'),
    );
    expect(firstTileSwap).toBeGreaterThan(-1);
    expect(firstUntransformed).toBeGreaterThan(firstTileSwap);
  });
});
