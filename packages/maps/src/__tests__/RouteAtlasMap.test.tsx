import { renderToString } from 'react-dom/server';
import { VisibleRoutes } from '../../VisibleRoutes';
import {
  applyRelativeTransform,
  buildWorkerRoutes,
  computeTransformBasis,
  unprojectMercatorRef,
} from '../AtlasRoutesCanvas';
import { RouteAtlasMap } from '../RouteAtlasMap';
import { decodeRoutes, type GeoBounds, type MapRoute, mercatorRefPoint } from '../routeFrame';
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
  it('renders offline placeholder tiles, Mercator route paths, canvas overlay, and zoom controls when tileSource is offline', () => {
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
    expect(html).toContain('data-tone="cobalt"');
    expect(html).toContain('data-tone="vermilion"');
    expect(html).toContain('data:image/svg+xml,');
  });

  it('renders Stadia tiles, filtered route paths, and zoom controls when online', () => {
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
    expect(html).toContain('class="pigeon-overlays"');
    expect(html).toContain('pointer-events:none');
    expect(html).toContain('data-tone="cobalt"');
    expect(html).not.toContain('data-tone="vermilion"');
    expect(html).toContain('vector-effect="non-scaling-stroke"');
    expect(html).toMatch(/scale\(\d+\.\d{6}\)/);
    expect(html).toMatch(/d="M\d{5,}/);
  });

  it('projects, unprojects, and computes relative GPU gesture transform matrices', () => {
    const sf: [number, number] = [37.7749, -122.4194];
    const ref = mercatorRefPoint(sf);
    const roundTripped = unprojectMercatorRef(ref);
    expect(roundTripped[0]).toBeCloseTo(sf[0], 4);
    expect(roundTripped[1]).toBeCloseTo(sf[1], 4);

    const base = computeTransformBasis(sf, 11, 800, 600);
    const zoomed = computeTransformBasis(sf, 12, 800, 600);
    const target = { style: { transform: 'initial' } } as unknown as HTMLElement;
    applyRelativeTransform(target, base, base);
    expect(target.style.transform).toBe('');
    applyRelativeTransform(target, zoomed, base);
    expect(target.style.transform).toContain('scale(2.00000)');

    const workerRoutes = buildWorkerRoutes(decodeRoutes(ROUTES));
    expect(workerRoutes).toHaveLength(2);
    expect(workerRoutes[0]?.legs[0]?.length).toBeGreaterThan(1);
  });
});
