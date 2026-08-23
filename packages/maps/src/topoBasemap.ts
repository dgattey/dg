import type { Point } from 'pigeon-maps';
import { type LatLngBounds, viewportLatLngBounds } from './routeGeometry';
import {
  FIELD_COLS,
  FIELD_ROWS,
  fbm,
  ISO_COUNT,
  marchingSquares,
  stitchSegments,
} from './topoField';

export const TOPO_LAND = '#e9e3c4';

export type { LatLngBounds };

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

export type TopoDot = {
  fill: string;
  id: string;
  opacity: number;
  point: Point;
  radiusLat: number;
  radiusLng: number;
};

export type TopoLayers = {
  bands: Array<TopoFill>;
  canopy: Array<TopoDot>;
  contours: Array<TopoStroke>;
  grainSeed: number;
  land: string;
  roads: Array<TopoStroke>;
  shore: Array<TopoStroke>;
  water: Array<TopoFill>;
};

export type TopoViewport = {
  center: Point;
  height: number;
  width: number;
  zoom: number;
};

const WATER = '#a4bfd0';
const WATER_DEEP = '#8eafc2';
const SHORE = 'rgba(70, 96, 88, 0.55)';
const CONTOUR = 'rgba(60, 80, 50, 0.34)';
const INDEX_CONTOUR = 'rgba(48, 66, 40, 0.5)';
const ROAD = 'rgba(120, 112, 96, 0.32)';
const CANOPY = '#6f8d56';
const WASH = ['#d5dcb4', '#c3d09a', '#aebc86'] as const;

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

function coastLongitude(lat: number, shape: LatLngBounds, coastLng: number, phase: number): number {
  const latSpan = shape.maxLat - shape.minLat || 1;
  const lngSpan = shape.maxLng - shape.minLng || 1;
  const t = (lat - shape.minLat) / latSpan;
  return (
    coastLng +
    Math.sin(t * Math.PI * 3.2 + phase) * lngSpan * 0.028 +
    Math.sin(t * Math.PI * 1.1 + phase * 0.5) * lngSpan * 0.016
  );
}

function waterRing({
  coastLng,
  field,
  oceanFactor,
  phase,
  shape,
  west,
}: {
  coastLng: number;
  field: LatLngBounds;
  oceanFactor: number;
  phase: number;
  shape: LatLngBounds;
  west: boolean;
}): Array<Point> {
  const latSpan = field.maxLat - field.minLat;
  const lngSpan = field.maxLng - field.minLng;
  const samples = 48;
  const coast: Array<Point> = [];
  for (let index = 0; index <= samples; index += 1) {
    const lat = field.minLat + (index / samples) * latSpan;
    coast.push([lat, coastLongitude(lat, shape, coastLng, phase)]);
  }

  const oceanLng = west
    ? field.minLng - lngSpan * oceanFactor
    : field.maxLng + lngSpan * oceanFactor;
  const south = field.minLat - latSpan * 0.08;
  const north = field.maxLat + latSpan * 0.08;
  const oceanSouth: Point = [south, oceanLng];
  const oceanNorth: Point = [north, oceanLng];
  if (west) {
    return [oceanSouth, ...coast, oceanNorth, oceanSouth];
  }
  return [oceanSouth, ...[...coast].reverse(), oceanNorth, oceanSouth];
}

function shoreLine(
  field: LatLngBounds,
  shape: LatLngBounds,
  coastLng: number,
  phase: number,
): Array<Point> {
  const latSpan = field.maxLat - field.minLat;
  const line: Array<Point> = [];
  const samples = 48;
  for (let index = 0; index <= samples; index += 1) {
    const lat = field.minLat + (index / samples) * latSpan;
    line.push([lat, coastLongitude(lat, shape, coastLng, phase)]);
  }
  return line;
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

function isWaterLng(lng: number, coast: number, west: boolean) {
  return west ? lng < coast : lng > coast;
}

/**
 * Invented outdoors layers in lat/lng. Coast sits on the route's geography;
 * the contour field fills the card viewBox when a viewport is passed.
 */
export function buildTopoLayers(points: Array<Point>, viewport?: TopoViewport): TopoLayers {
  const tight = routeBounds(points);
  const shape = expandBounds(tight, 0.16);
  const field = viewport ? expandBounds(viewportLatLngBounds(viewport), 0.12) : shape;
  const seed = seedFromBounds(tight);
  const next = createRng(seed);
  const centroid = routeCentroid(points);
  const shapeLngSpan = shape.maxLng - shape.minLng || 1;
  const latSpan = field.maxLat - field.minLat || 1;
  const lngSpan = field.maxLng - field.minLng || 1;
  const westWater = (centroid[1] - shape.minLng) / shapeLngSpan > 0.42;
  const coastLng = westWater
    ? shape.minLng + shapeLngSpan * (0.22 + next() * 0.05)
    : shape.maxLng - shapeLngSpan * (0.22 + next() * 0.05);
  const phase = next() * Math.PI * 2;

  const landMinLng = westWater ? coastLng : field.minLng;
  const landMaxLng = westWater ? field.maxLng : coastLng;
  const landLngSpan = Math.max(landMaxLng - landMinLng, lngSpan * 0.4);

  const cols = FIELD_COLS;
  const rows = FIELD_ROWS;
  const xs = Array.from({ length: cols + 1 }, (_, col) => field.minLng + (col / cols) * lngSpan);
  const ys = Array.from({ length: rows + 1 }, (_, row) => field.minLat + (row / rows) * latSpan);
  const samples: Array<number> = [];
  let minLand = 1;
  let maxLand = 0;

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const lat = ys[row] ?? field.minLat;
    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const lng = xs[col] ?? field.minLng;
      const coast = coastLongitude(lat, shape, coastLng, phase);
      if (isWaterLng(lng, coast, westWater)) {
        samples.push(-0.2);
        continue;
      }
      const ridge = fbm(u * 3.4 + 2.1, v * 3.4, seed);
      const detail = fbm(u * 9.5 + 8, v * 9.5, seed + 17, 4);
      const value = ridge * 0.72 + detail * 0.28;
      minLand = Math.min(minLand, value);
      maxLand = Math.max(maxLand, value);
      samples.push(value);
    }
  }

  const span = Math.max(maxLand - minLand, 0.08);
  const contours: Array<TopoStroke> = [];
  const bands: Array<TopoFill> = [];

  for (let level = 0; level < ISO_COUNT; level += 1) {
    const iso = minLand + ((level + 1) / (ISO_COUNT + 1)) * span;
    const lines = stitchSegments(marchingSquares({ cols, iso, rows, samples, xs, ys })).filter(
      (line) => line.length > 3,
    );
    const index = (level + 1) % 4 === 0;
    for (const [lineIndex, line] of lines.entries()) {
      contours.push({
        id: `iso-${level}-${lineIndex}`,
        line,
        opacity: 1,
        stroke: index ? INDEX_CONTOUR : CONTOUR,
        strokeWidth: index ? 1.5 : 1,
      });
    }
    if (level === 7 || level === 13) {
      const wash = WASH[level === 7 ? 1 : 2] ?? WASH[2];
      for (const [lineIndex, line] of lines.entries()) {
        const first = line[0];
        const last = line[line.length - 1];
        if (!first || !last) {
          continue;
        }
        if (Math.hypot(first[0] - last[0], first[1] - last[1]) > latSpan * 0.03) {
          continue;
        }
        bands.push({
          fill: wash,
          id: `wash-${level}-${lineIndex}`,
          opacity: 0.055,
          ring: line,
        });
      }
    }
  }

  const canopy: Array<TopoDot> = [];
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const elevation = samples[row * (cols + 1) + col] ?? -1;
      if (elevation < minLand + span * 0.5) {
        continue;
      }
      const u = (col + (next() - 0.5) * 0.7) / cols;
      const v = (row + (next() - 0.5) * 0.7) / rows;
      const speck = fbm(u * 28 + 3, v * 28, seed + 41, 3);
      if (speck < 0.4) {
        continue;
      }
      const size = 0.0009 + speck * 0.0016;
      canopy.push({
        fill: CANOPY,
        id: `stipple-${row}-${col}`,
        opacity: 0.46 + speck * 0.16,
        point: [field.minLat + v * latSpan, field.minLng + u * lngSpan],
        radiusLat: latSpan * size,
        radiusLng: lngSpan * size * (0.65 + next() * 0.55),
      });
    }
  }
  for (let index = 0; index < 220; index += 1) {
    const u = next();
    const v = next();
    const lat = field.minLat + v * latSpan;
    const lng = field.minLng + u * lngSpan;
    const coast = coastLongitude(lat, shape, coastLng, phase);
    if (isWaterLng(lng, coast, westWater)) {
      continue;
    }
    const elevation =
      fbm(u * 3.4 + 2.1, v * 3.4, seed) * 0.72 + fbm(u * 9.5 + 8, v * 9.5, seed + 17, 4) * 0.28;
    if (elevation < minLand + span * 0.48) {
      continue;
    }
    const speck = fbm(u * 28 + 3, v * 28, seed + 41, 3);
    if (speck < 0.38) {
      continue;
    }
    const size = 0.0011 + speck * 0.0022;
    canopy.push({
      fill: CANOPY,
      id: `canopy-${index}`,
      opacity: 0.42 + speck * 0.18,
      point: [lat, lng],
      radiusLat: latSpan * size,
      radiusLng: lngSpan * size * (0.7 + next() * 0.5),
    });
  }

  const waterRipples: Array<TopoStroke> = [0, 1].map((index) => {
    const offset = (westWater ? -1 : 1) * lngSpan * (0.04 + index * 0.035);
    const line: Array<Point> = [];
    for (let step = 0; step <= 20; step += 1) {
      const lat = field.minLat + (step / 20) * latSpan;
      line.push([lat, coastLongitude(lat, shape, coastLng, phase) + offset]);
    }
    return {
      id: `ripple-${index}`,
      line,
      opacity: 0.28,
      stroke: 'rgba(70, 96, 108, 0.35)',
      strokeWidth: 0.6,
    };
  });

  const roads: Array<TopoStroke> = [0, 1].map((index) => {
    const start: Point = [
      field.minLat + (0.18 + next() * 0.16 + index * 0.38) * latSpan,
      landMinLng + next() * landLngSpan * 0.16,
    ];
    const end: Point = [
      start[0] + (next() - 0.48) * latSpan * 0.3,
      landMaxLng - next() * landLngSpan * 0.14,
    ];
    const mid: Point = [
      (start[0] + end[0]) / 2 + (next() - 0.5) * latSpan * 0.12,
      (start[1] + end[1]) / 2 + (next() - 0.5) * landLngSpan * 0.1,
    ];
    return {
      id: `road-${index}`,
      line: landPolyline(start, end, mid, 18),
      opacity: 1,
      stroke: ROAD,
      strokeWidth: 0.7,
    };
  });

  return {
    bands,
    canopy,
    contours,
    grainSeed: seed,
    land: TOPO_LAND,
    roads: [...roads, ...waterRipples],
    shore: [
      {
        id: 'shore',
        line: shoreLine(field, shape, coastLng, phase),
        opacity: 1,
        stroke: SHORE,
        strokeWidth: 1.15,
      },
    ],
    water: [
      {
        fill: WATER,
        id: 'water-shelf',
        opacity: 0.92,
        ring: waterRing({
          coastLng,
          field,
          oceanFactor: 0.02,
          phase,
          shape,
          west: westWater,
        }),
      },
      {
        fill: WATER_DEEP,
        id: 'water-deep',
        opacity: 0.28,
        ring: waterRing({
          coastLng: coastLng + (westWater ? -lngSpan * 0.06 : lngSpan * 0.06),
          field: expandBounds(field, -0.05),
          oceanFactor: 0.08,
          phase: phase + 0.28,
          shape,
          west: westWater,
        }),
      },
    ],
  };
}
