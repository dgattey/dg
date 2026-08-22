import type { Point } from 'pigeon-maps';

export const TOPO_LAND = '#efe6cf';

export type LatLngBounds = {
  maxLat: number;
  maxLng: number;
  minLat: number;
  minLng: number;
};

export type TopoFill = {
  fill: string;
  id: string;
  opacity: number;
  ring: Array<Point>;
};

export type TopoStroke = {
  id: string;
  line: Array<Point>;
  opacity: number;
  stroke: string;
  strokeWidth: number;
};

export type TopoLayers = {
  bands: Array<TopoFill>;
  contours: Array<TopoStroke>;
  land: string;
  roads: Array<TopoStroke>;
  water: Array<TopoFill>;
};

const SAGE = ['#e2e6c2', '#cfd8a8', '#b7c490', '#9aaf78'] as const;
const WATER = '#9db8c8';
const WATER_DEEP = '#86a6b8';
const CONTOUR = '#c2b89a';
const ROAD = '#e7dfcc';

export function routeBounds(points: Array<Point>): LatLngBounds {
  const first = points[0];
  if (!first) {
    return { maxLat: 0, maxLng: 0, minLat: 0, minLng: 0 };
  }

  return points.reduce(
    (bounds, [lat, lng]) => ({
      maxLat: Math.max(bounds.maxLat, lat),
      maxLng: Math.max(bounds.maxLng, lng),
      minLat: Math.min(bounds.minLat, lat),
      minLng: Math.min(bounds.minLng, lng),
    }),
    {
      maxLat: first[0],
      maxLng: first[1],
      minLat: first[0],
      minLng: first[1],
    },
  );
}

export function expandBounds(bounds: LatLngBounds, factor: number): LatLngBounds {
  const latPad = (bounds.maxLat - bounds.minLat) * factor || 0.02;
  const lngPad = (bounds.maxLng - bounds.minLng) * factor || 0.02;
  return {
    maxLat: bounds.maxLat + latPad,
    maxLng: bounds.maxLng + lngPad,
    minLat: bounds.minLat - latPad,
    minLng: bounds.minLng - lngPad,
  };
}

export function routeCentroid(points: Array<Point>): Point {
  if (points.length === 0) {
    return [0, 0];
  }
  const sum = points.reduce<[number, number]>(
    ([lat, lng], point) => [lat + point[0], lng + point[1]],
    [0, 0],
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

function hash32(value: number) {
  return Math.imul(value ^ (value >>> 16), 2246822507) >>> 0;
}

export function seedFromBounds(bounds: LatLngBounds) {
  return (
    (hash32(Math.round(bounds.minLat * 1e5)) ^
      hash32(Math.round(bounds.minLng * 1e5)) ^
      hash32(Math.round(bounds.maxLat * 1e5)) ^
      hash32(Math.round(bounds.maxLng * 1e5))) >>>
    0
  );
}

function createRng(seed: number) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function ellipseRing(
  center: Point,
  radiusLng: number,
  radiusLat: number,
  steps: number,
  warp: (angle: number) => number,
): Array<Point> {
  const ring: Array<Point> = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const scale = warp(angle);
    ring.push([
      center[0] + Math.sin(angle) * radiusLat * scale,
      center[1] + Math.cos(angle) * radiusLng * scale,
    ]);
  }
  return ring;
}

function waterRing(
  bounds: LatLngBounds,
  coastLng: number,
  phase: number,
  west: boolean,
  oceanFactor: number,
): Array<Point> {
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const samples = 40;
  const coast: Array<Point> = [];
  for (let index = 0; index <= samples; index += 1) {
    const lat = bounds.minLat + (index / samples) * latSpan;
    const wave = Math.sin(index * 0.48 + phase) * lngSpan * 0.028;
    const bulge = Math.sin(index * 0.18 + phase * 0.5) * lngSpan * 0.018;
    coast.push([lat, coastLng + wave + bulge]);
  }

  const oceanLng = west
    ? bounds.minLng - lngSpan * oceanFactor
    : bounds.maxLng + lngSpan * oceanFactor;
  const south = bounds.minLat - latSpan * 0.08;
  const north = bounds.maxLat + latSpan * 0.08;
  const oceanSouth: Point = [south, oceanLng];
  const oceanNorth: Point = [north, oceanLng];
  if (west) {
    return [oceanSouth, ...coast, oceanNorth, oceanSouth];
  }
  return [oceanSouth, ...[...coast].reverse(), oceanNorth, oceanSouth];
}

function landPolyline(start: Point, end: Point, mid: Point, steps: number): Array<Point> {
  const line: Array<Point> = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const omt = 1 - t;
    line.push([
      omt * omt * start[0] + 2 * omt * t * mid[0] + t * t * end[0],
      omt * omt * start[1] + 2 * omt * t * mid[1] + t * t * end[1],
    ]);
  }
  return line;
}

/**
 * Invented outdoors layers in lat/lng, derived from the route bbox so the
 * same activity always paints the same cream/sage land, water, and contours.
 * Features stay inside a tight pad of the route so they remain in the card.
 */
export function buildTopoLayers(points: Array<Point>): TopoLayers {
  const tight = routeBounds(points);
  const bounds = expandBounds(tight, 0.16);
  const next = createRng(seedFromBounds(tight));
  const centroid = routeCentroid(points);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const westWater = (centroid[1] - bounds.minLng) / lngSpan > 0.42;
  const coastLng = westWater
    ? bounds.minLng + lngSpan * (0.22 + next() * 0.05)
    : bounds.maxLng - lngSpan * (0.22 + next() * 0.05);
  const phase = next() * Math.PI * 2;

  const landMinLng = westWater ? coastLng : bounds.minLng;
  const landMaxLng = westWater ? bounds.maxLng : coastLng;
  const landLngSpan = Math.max(landMaxLng - landMinLng, lngSpan * 0.4);

  const bands: Array<TopoFill> = [];
  const contours: Array<TopoStroke> = [];

  for (let hill = 0; hill < 4; hill += 1) {
    const center: Point = [
      bounds.minLat + (0.14 + next() * 0.72) * latSpan,
      landMinLng + (0.18 + next() * 0.64) * landLngSpan,
    ];
    const radiusLng = landLngSpan * (0.28 + next() * 0.22);
    const radiusLat = latSpan * (0.22 + next() * 0.2);
    const warpPhase = next() * Math.PI * 2;
    const stretch = 1.15 + next() * 0.35;

    for (let band = 0; band < 5; band += 1) {
      const scale = 1 - band * 0.15;
      const ring = ellipseRing(
        center,
        radiusLng * scale * stretch,
        radiusLat * scale,
        44,
        (angle) =>
          0.78 +
          0.16 * Math.sin(angle * 2 + warpPhase + band) +
          0.08 * Math.sin(angle * 5 + warpPhase * 0.6),
      );
      bands.push({
        fill: SAGE[Math.min(band, SAGE.length - 1)] ?? SAGE[3],
        id: `band-${hill}-${band}`,
        opacity: 0.34 + band * 0.1,
        ring,
      });
      if (band > 0) {
        contours.push({
          id: `contour-${hill}-${band}`,
          line: ring,
          opacity: 0.32 + band * 0.04,
          stroke: CONTOUR,
          strokeWidth: band === 4 ? 1.15 : 0.7,
        });
      }
    }
  }

  for (let index = 0; index < 9; index += 1) {
    const lat = bounds.minLat + ((index + 0.4) / 9) * latSpan;
    const line: Array<Point> = [];
    const samples = 28;
    const drift = (next() - 0.5) * latSpan * 0.04;
    const wavePhase = next() * Math.PI * 2;
    for (let sample = 0; sample <= samples; sample += 1) {
      const t = sample / samples;
      const lng = landMinLng + t * landLngSpan;
      line.push([lat + drift + Math.sin(t * Math.PI * 2.4 + wavePhase) * latSpan * 0.018, lng]);
    }
    contours.push({
      id: `field-${index}`,
      line,
      opacity: 0.22,
      stroke: CONTOUR,
      strokeWidth: 0.55,
    });
  }

  const roads: Array<TopoStroke> = [0, 1, 2].map((index) => {
    const start: Point = [
      bounds.minLat + (0.12 + next() * 0.18 + index * 0.28) * latSpan,
      landMinLng + next() * landLngSpan * 0.18,
    ];
    const end: Point = [
      start[0] + (next() - 0.45) * latSpan * 0.28,
      landMaxLng - next() * landLngSpan * 0.16,
    ];
    const mid: Point = [
      (start[0] + end[0]) / 2 + (next() - 0.5) * latSpan * 0.14,
      (start[1] + end[1]) / 2 + (next() - 0.5) * landLngSpan * 0.12,
    ];
    return {
      id: `road-${index}`,
      line: landPolyline(start, end, mid, 16),
      opacity: 0.55,
      stroke: ROAD,
      strokeWidth: 1.15,
    };
  });

  return {
    bands,
    contours,
    land: TOPO_LAND,
    roads,
    water: [
      {
        fill: WATER,
        id: 'water-shelf',
        opacity: 1,
        ring: waterRing(bounds, coastLng, phase, westWater, 0.02),
      },
      {
        fill: WATER_DEEP,
        id: 'water-deep',
        opacity: 0.42,
        ring: waterRing(
          expandBounds(bounds, -0.06),
          coastLng + (westWater ? -lngSpan * 0.07 : lngSpan * 0.07),
          phase + 0.35,
          westWater,
          0.08,
        ),
      },
    ],
  };
}
