import { encodePolyline } from '@dg/maps/src/routeGeometry';
import { coverageRoutePath } from '../coverageRoutePath';

/** One view box unit per thousandth of a degree, north up, over a 100 × 100 box. */
const frame = {
  projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1000, lng: 1000 } },
  viewBox: '0 0 100 100',
};

/** A route through points in view box units. */
const route = (...points: Array<[number, number]>) => ({
  polyline: encodePolyline(points.map(([x, y]) => [-y / 1000, x / 1000])),
});

describe('coverageRoutePath', () => {
  it('draws each route as a run of whole-unit steps', () => {
    expect(
      coverageRoutePath([route([10, 10], [20, 10], [20, 30]), route([50, 50], [60, 40])], frame),
    ).toBe('M10 10l10 0 0 20M50 50l10 -10');
  });

  it('skips outings without a route and routes outside the box', () => {
    expect(coverageRoutePath([{ polyline: null }, route([200, 200], [300, 200])], frame)).toBe('');
  });

  it('keeps the segments that cross the edge and breaks the run while outside', () => {
    expect(
      coverageRoutePath([route([90, 50], [150, 50], [200, 50], [150, 60], [80, 60])], frame),
    ).toBe('M90 50l60 0M150 60l-70 0');
  });

  it('thins points closer together than the map can show', () => {
    expect(coverageRoutePath([route([10, 10], [11, 10], [12, 10], [12, 11])], frame)).toBe(
      'M10 10l2 0',
    );
  });
});
