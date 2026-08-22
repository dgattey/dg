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

const SAGE = ['#e4e6c6', '#d2d8b0', '#c0cca0', '#adbe8c'] as const;
const WATER = '#c3d3db';
const WATER_DEEP = '#b2c5d0';
const CONTOUR = '#c6bda4';
const ROAD = '#d2c8b0';

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
): Array<Point> {
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const samples = 32;
  const coast: Array<Point> = [];
  for (let index = 0; index <= samples; index += 1) {
    const lat = bounds.minLat + (index / samples) * latSpan;
    const wave = Math.sin(index * 0.55 + phase) * lngSpan * 0.035;
    const bulge = Math.sin(index * 0.22 + phase * 0.4) * lngSpan * 0.02;
    coast.push([lat, coastLng + wave + bulge]);
  }

  const oceanLng = west ? bounds.minLng - lngSpan * 0.55 : bounds.maxLng + lngSpan * 0.55;
  const south = bounds.minLat - latSpan * 0.25;
  const north = bounds.maxLat + latSpan * 0.25;
  const southWest: Point = [south, oceanLng];
  const northWest: Point = [north, oceanLng];
  if (west) {
    return [southWest, ...coast, northWest, southWest];
  }
  return [southWest, ...[...coast].reverse(), northWest, southWest];
}

/**
 * Invented outdoors layers in lat/lng, derived from the route bbox so the
 * same activity always paints the same cream/sage land, water, and contours.
 */
export function buildTopoLayers(points: Array<Point>): TopoLayers {
  const tight = routeBounds(points);
  const bounds = expandBounds(tight, 1.2);
  const next = createRng(seedFromBounds(tight));
  const centroid = routeCentroid(points);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const westWater = (centroid[1] - bounds.minLng) / lngSpan > 0.42;
  const coastLng = westWater
    ? bounds.minLng + lngSpan * (0.16 + next() * 0.06)
    : bounds.maxLng - lngSpan * (0.16 + next() * 0.06);
  const phase = next() * Math.PI * 2;

  const landMinLng = westWater ? coastLng : bounds.minLng;
  const landMaxLng = westWater ? bounds.maxLng : coastLng;
  const landLngSpan = Math.max(landMaxLng - landMinLng, lngSpan * 0.35);

  const bands: Array<TopoFill> = [];
  const contours: Array<TopoStroke> = [];

  for (let hill = 0; hill < 3; hill += 1) {
    const center: Point = [
      bounds.minLat + (0.18 + next() * 0.64) * latSpan,
      landMinLng + (0.2 + next() * 0.6) * landLngSpan,
    ];
    const radiusLng = landLngSpan * (0.22 + next() * 0.18);
    const radiusLat = latSpan * (0.2 + next() * 0.16);
    const warpPhase = next() * Math.PI * 2;

    for (let band = 0; band < 4; band += 1) {
      const scale = 1 - band * 0.18;
      const ring = ellipseRing(
        center,
        radiusLng * scale,
        radiusLat * scale,
        36,
        (angle) => 0.86 + 0.14 * Math.sin(angle * 2 + warpPhase + band),
      );
      bands.push({
        fill: SAGE[band] ?? SAGE[3],
        id: `band-${hill}-${band}`,
        opacity: 0.42 + band * 0.08,
        ring,
      });
      if (band > 0) {
        contours.push({
          id: `contour-${hill}-${band}`,
          line: ring,
          opacity: 0.38,
          stroke: CONTOUR,
          strokeWidth: 0.9,
        });
      }
    }
  }

  const roads: Array<TopoStroke> = [0, 1].map((index) => {
    const startLat = bounds.minLat + (0.15 + next() * 0.2 + index * 0.35) * latSpan;
    const endLat = startLat + (next() - 0.5) * latSpan * 0.25;
    const startLng = landMinLng + next() * landLngSpan * 0.2;
    const endLng = landMaxLng - next() * landLngSpan * 0.2;
    const midLat = (startLat + endLat) / 2 + (next() - 0.5) * latSpan * 0.12;
    const midLng = (startLng + endLng) / 2 + (next() - 0.5) * landLngSpan * 0.1;
    const line: Array<Point> = [];
    const steps = 14;
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const omt = 1 - t;
      line.push([
        omt * omt * startLat + 2 * omt * t * midLat + t * t * endLat,
        omt * omt * startLng + 2 * omt * t * midLng + t * t * endLng,
      ]);
    }
    return { id: `road-${index}`, line, opacity: 0.28, stroke: ROAD, strokeWidth: 1.05 };
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
        opacity: 0.92,
        ring: waterRing(bounds, coastLng, phase, westWater),
      },
      {
        fill: WATER_DEEP,
        id: 'water-deep',
        opacity: 0.35,
        ring: waterRing(
          expandBounds(bounds, -0.08),
          coastLng + (westWater ? -lngSpan * 0.06 : lngSpan * 0.06),
          phase + 0.4,
          westWater,
        ),
      },
    ],
  };
}
