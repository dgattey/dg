import { latestRouteView, regionForPoint } from '../../atlasGeometry';
import type { GeoBounds } from '../routeFrame';
import { encodePolyline } from '../routeGeometry';

const loop = (latitude: number, longitude: number) =>
  encodePolyline([
    [latitude, longitude],
    [latitude + 0.01, longitude + 0.01],
    [latitude, longitude + 0.02],
  ]);

const BAY: GeoBounds = [
  [37.4, -122.5],
  [37.9, -122.1],
];
const DIEGO: GeoBounds = [
  [32.6, -117.3],
  [32.9, -117.0],
];

describe('atlas regions', () => {
  it('names the city whose box holds a point', () => {
    expect(regionForPoint([37.77, -122.42])).toBe('sf');
    expect(regionForPoint([32.72, -117.16])).toBe('sd');
    expect(regionForPoint([39.2, -120.1])).toBeNull();
    expect(regionForPoint([85, 0])).toBeNull();
  });

  it('frames a bay route with the bay region and keeps the strip selected', () => {
    const view = latestRouteView(
      [loop(37.77, -122.42), loop(39.2, -120.1)],
      [
        { bounds: BAY, key: 'sf', label: 'Bay Area' },
        { bounds: DIEGO, key: 'sd', label: 'San Diego' },
      ],
    );
    expect(view).toEqual({ bounds: BAY, region: 'sf' });
  });

  it('pads a mountain cluster and leaves both regions unselected', () => {
    const view = latestRouteView(
      [loop(39.2, -120.1), loop(39.22, -120.12), loop(37.77, -122.42)],
      [{ bounds: BAY, key: 'sf', label: 'Bay Area' }],
    );
    expect(view?.region).toBeNull();
    const [[south, west], [north, east]] = view?.bounds ?? [
      [0, 0],
      [0, 0],
    ];
    expect(south).toBeLessThan(39.2);
    expect(north).toBeGreaterThan(39.23);
    expect(west).toBeLessThan(-120.12);
    expect(east).toBeGreaterThan(-120.08);
    expect(south).toBeGreaterThan(38);
    expect(north - south).toBeGreaterThanOrEqual(0.05);
    expect(east - west).toBeGreaterThanOrEqual(0.07);
  });

  it('returns null when no polyline is a route', () => {
    expect(latestRouteView(['_', encodePolyline([[37, -122]])], [])).toBeNull();
  });
});
