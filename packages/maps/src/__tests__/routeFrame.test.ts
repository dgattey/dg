import type { Point } from 'pigeon-maps';
import {
  decodeRoutes,
  frameAround,
  framePaths,
  homeBounds,
  routeBounds,
  routeLegs,
  routeSilhouette,
} from '../routeFrame';
import { encodePolyline } from '../routeGeometry';

const loop = ([latitude, longitude]: Point): Array<Point> => [
  [latitude, longitude],
  [latitude + 0.01, longitude + 0.01],
  [latitude, longitude + 0.02],
];

const route = (id: number, start: Point, tone = 'vermilion') => ({
  id,
  polyline: encodePolyline(loop(start)),
  tone,
});

const bay = [
  route(1, [37.77, -122.42]),
  route(2, [37.8, -122.27], 'cobalt'),
  route(3, [37.44, -122.16]),
];
const away = [route(4, [32.72, -117.16]), route(5, [39.1, -120.03], 'viridian')];

describe('route frames', () => {
  it('drops corrupt and single-point polylines', () => {
    expect(
      decodeRoutes([
        { id: 1, polyline: '_', tone: 'vermilion' },
        { id: 2, polyline: encodePolyline([[37, -122]]), tone: 'vermilion' },
        route(3, [37.77, -122.42]),
      ]).map(({ id }) => id),
    ).toEqual([3]);
  });

  it('frames home around the routes that start there, not the outliers', () => {
    const bounds = homeBounds(decodeRoutes([...bay, ...away]));
    expect(bounds).not.toBeNull();
    const [[south, west], [north, east]] = bounds ?? [
      [0, 0],
      [0, 0],
    ];
    expect(south).toBeGreaterThan(37.4);
    expect(north).toBeLessThan(37.9);
    expect(west).toBeGreaterThan(-122.5);
    expect(east).toBeLessThan(-122.1);
  });

  it('has no home without routes', () => {
    expect(homeBounds([])).toBeNull();
  });

  it('inks one path per tone and leaves out routes far from the frame', () => {
    const decoded = decodeRoutes([...bay, ...away]);
    const frame = frameAround(
      [
        [37.4, -122.5],
        [37.85, -122.1],
      ],
      { height: 300, padding: 10, width: 400 },
    );
    const paths = framePaths(frame, decoded);
    expect(paths.map(({ tone }) => tone)).toEqual(['vermilion', 'cobalt']);
    expect(paths[0]?.d.match(/M/g)).toHaveLength(2);
  });

  it('breaks a route where a paused recording jumps across town', () => {
    const mission: Array<Point> = [
      [37.76, -122.42],
      [37.765, -122.415],
    ];
    const oakland: Array<Point> = [
      [37.8, -122.27],
      [37.805, -122.265],
    ];
    expect(routeLegs([...mission, ...oakland, [37.9, -122.0]])).toEqual([mission, oakland]);
    expect(routeLegs(loop([37.77, -122.42]))).toEqual([loop([37.77, -122.42])]);
  });

  it('bounds a polyline and rejects one that is not a route', () => {
    expect(
      routeBounds(
        encodePolyline([
          [10, 20],
          [12, 18],
          [11, 22],
        ]),
      ),
    ).toEqual([
      [10, 18],
      [12, 22],
    ]);
    expect(routeBounds(encodePolyline([[10, 20]]))).toBeNull();
    expect(routeBounds('_')).toBeNull();
  });

  it('fits a lone route into a silhouette square', () => {
    const d = routeSilhouette(encodePolyline(loop([37.77, -122.42])), 30, 3) ?? '';
    const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    expect(numbers.length).toBeGreaterThan(2);
    expect(routeSilhouette('_', 30, 3)).toBeNull();
  });
});
