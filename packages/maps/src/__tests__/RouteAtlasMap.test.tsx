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
  it('renders offline placeholder tiles, canvas route layer, and zoom controls when tileSource is offline', () => {
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
    expect(html).toContain('data-tones="cobalt,vermilion"');
    expect(html).toContain('data:image/svg+xml,');
  });

  it('renders Stadia tiles, filtered route tones, and zoom controls when online', () => {
    const html = renderToString(
      <VisibleRoutes value={new Set([1])}>
        <RouteAtlasMap
          bounds={BOUNDS}
          label="Route atlas"
          routes={ROUTES}
          tileSource={{ apiKey: null, mode: 'stadia' }}
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
