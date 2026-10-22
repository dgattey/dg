import type { StravaRouteTrace } from '@dg/content-models/strava/StravaHistory';
import { routeFocus, routeGroups, routeSilhouette } from '../bayRoutes';
import type { LatLon, MercatorFrame } from '../mercatorFrame';

const ATLAS: MercatorFrame = { center: [37.828, -122.4], height: 1060, lonSpan: 0.4, width: 880 };

function encodeValue(value: number) {
  let rest = value < 0 ? ~(value << 1) : value << 1;
  let out = '';
  while (rest >= 0x20) {
    out += String.fromCharCode((0x20 | (rest & 0x1f)) + 63);
    rest >>= 5;
  }
  return out + String.fromCharCode(rest + 63);
}

function encode(points: ReadonlyArray<LatLon>) {
  let lat = 0;
  let lon = 0;
  return points
    .map(([nextLat, nextLon]) => {
      const [dLat, dLon] = [Math.round(nextLat * 1e5) - lat, Math.round(nextLon * 1e5) - lon];
      lat += dLat;
      lon += dLon;
      return encodeValue(dLat) + encodeValue(dLon);
    })
    .join('');
}

/** Absolute points from `M x y l dx dy ...` path data. */
function pathPoints(d: string) {
  return d
    .split('M')
    .filter(Boolean)
    .flatMap((part) => {
      const [x = 0, y = 0, ...deltas] = (part.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      const points: Array<[number, number]> = [[x, y]];
      for (let index = 0; index < deltas.length; index += 2) {
        const [lastX, lastY] = points[points.length - 1] ?? [x, y];
        points.push([lastX + (deltas[index] ?? 0), lastY + (deltas[index + 1] ?? 0)]);
      }
      return points;
    });
}

const loop: ReadonlyArray<LatLon> = [
  [37.77, -122.47],
  [37.8, -122.47],
  [37.8, -122.42],
  [37.77, -122.42],
  [37.77, -122.47],
];

const trace = (
  overrides: Partial<StravaRouteTrace> & Pick<StravaRouteTrace, 'id'>,
): StravaRouteTrace => ({ polyline: encode(loop), sport: 'ride', year: 2025, ...overrides });

const summary = (groups: ReturnType<typeof routeGroups>) =>
  groups.map(({ routes, sport, year }) => ({ routes, sport, year }));

describe('routeGroups', () => {
  it('merges each sport and year into one group, oldest year first', () => {
    const groups = routeGroups(ATLAS, [
      trace({ id: 4, sport: 'run', year: 2026 }),
      trace({ id: 3 }),
      trace({ id: 2, polyline: encode(loop.slice(0, 3)) }),
      trace({ id: 1, sport: 'hike' }),
    ]);
    expect(summary(groups)).toEqual([
      { routes: 2, sport: 'ride', year: 2025 },
      { routes: 1, sport: 'hike', year: 2025 },
      { routes: 1, sport: 'run', year: 2026 },
    ]);
  });

  it('counts a repeated loop again without drawing it twice', () => {
    const [once] = routeGroups(ATLAS, [trace({ id: 1 })]);
    const [thrice] = routeGroups(ATLAS, [trace({ id: 1 }), trace({ id: 2 }), trace({ id: 3 })]);
    expect(thrice?.routes).toBe(3);
    expect(thrice?.d).toBe(once?.d);
  });

  it('gives a shared segment to the newest year, so a year filter still draws it', () => {
    const groups = routeGroups(ATLAS, [trace({ id: 1, year: 2024 }), trace({ id: 2, year: 2026 })]);
    const [alone] = routeGroups(ATLAS, [trace({ id: 2, year: 2026 })]);
    expect(groups.find((group) => group.year === 2026)?.d).toBe(alone?.d);
    expect(summary(groups)).toEqual([
      { routes: 1, sport: 'ride', year: 2024 },
      { routes: 1, sport: 'ride', year: 2026 },
    ]);
  });

  it('keeps each sport whole when sports share a road', () => {
    const [ride] = routeGroups(ATLAS, [trace({ id: 1 })]);
    const groups = routeGroups(ATLAS, [trace({ id: 1 }), trace({ id: 2, sport: 'run' })]);
    expect(groups.map((group) => group.d)).toEqual([ride?.d, ride?.d]);
  });

  it('simplifies a dense straight line to its ends', () => {
    const dense: Array<LatLon> = Array.from({ length: 2000 }, (_, index) => [
      37.78,
      -122.5 + index * 0.00005,
    ]);
    const [group] = routeGroups(ATLAS, [trace({ id: 1, polyline: encode(dense) })]);
    const points = pathPoints(group?.d ?? '');
    expect(points.length).toBeLessThanOrEqual(3);
    const xs = points.map(([x]) => x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(
      (0.09995 / ATLAS.lonSpan) * ATLAS.width,
      0,
    );
  });

  it('skips traces outside the frame and polylines it cannot decode', () => {
    const tahoe = encode([
      [39.09, -120.03],
      [39.1, -120.02],
    ]);
    expect(
      routeGroups(ATLAS, [trace({ id: 1, polyline: tahoe }), trace({ id: 2, polyline: '~' })]),
    ).toEqual([]);
  });
});

describe('routeSilhouette', () => {
  it('fills the box on the tighter axis inside the padding', () => {
    const points = pathPoints(routeSilhouette(encode(loop), 30, 30, 3) ?? '');
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs, ...ys)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...xs, ...ys)).toBeLessThanOrEqual(27);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(24, 0);
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(24);
  });

  it('returns null for a polyline it cannot draw', () => {
    expect(routeSilhouette('~', 30, 30, 3)).toBeNull();
    expect(routeSilhouette(encode([[37.8, -122.4]]), 30, 30, 3)).toBeNull();
  });
});

describe('routeFocus', () => {
  it('frames the route inside the print', () => {
    const focus = routeFocus(encode(loop), 300, 200, 20);
    const points = pathPoints(focus?.d ?? '');
    const ys = points.map(([, y]) => y);
    expect(Math.min(...ys)).toBeCloseTo(20, 0);
    expect(Math.max(...ys)).toBeCloseTo(180, 0);
  });

  it('never zooms past a few kilometers across', () => {
    const tiny = encode([
      [37.8, -122.4],
      [37.8001, -122.4001],
    ]);
    expect(routeFocus(tiny, 300, 200, 20)?.frame.lonSpan).toBeGreaterThanOrEqual(0.03);
  });
});
