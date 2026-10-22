/**
 * Regenerates `strava/sfStreetGrid.ts`, the street grid the SF coverage figures
 * are measured against: DataSF's 41 analysis neighborhoods and every rideable
 * OSM street inside them, cut into ~10 m pieces. Run with `turbo strava:sf-grid`.
 * Pass `--neighborhoods <geojson>` or `--osm <overpass json>` to reuse downloads.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { log } from '@dg/shared-core/logging/log';
import {
  encodePolyline,
  type GridOrigin,
  projectToGrid,
  STREET_PIECE_METERS,
} from '../strava/streetGridGeometry';

const NEIGHBORHOODS_URL = 'https://data.sfgov.org/resource/j2bu-swwd.geojson?$limit=100';
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const SF_BBOX = '37.703,-122.519,37.835,-122.355';
const OVERPASS_QUERY = `[out:json][timeout:600];way["highway"](${SF_BBOX});out tags geom;`;
const ORIGIN: GridOrigin = { lat: 37.76, lng: -122.44 };
const OUTPUT = new URL('../strava/sfStreetGrid.ts', import.meta.url);
/** Outlines are drawn in tens of meters, simplified to within this many meters. */
const OUTLINE_UNIT_METERS = 10;
const OUTLINE_TOLERANCE_METERS = 8;
const BIOME_LINE_WIDTH = 100;

const DRIVABLE = new Set([
  'primary',
  'secondary',
  'tertiary',
  'residential',
  'unclassified',
  'living_street',
  'trunk',
]);
const SHARED_PATHS = new Set(['track', 'footway', 'pedestrian', 'bridleway']);
const BIKES_WELCOME = new Set(['yes', 'designated', 'permissive']);
const NO_ACCESS = new Set(['private', 'no']);

type Point = [number, number];
type Ring = Array<Point>;
type Neighborhood = { name: string; rings: Array<Ring>; box: [number, number, number, number] };
type OsmWay = {
  type: string;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
};
type GeoFeature = {
  properties: { nhood: string };
  geometry:
    | { type: 'Polygon'; coordinates: Array<Array<Point>> }
    | { type: 'MultiPolygon'; coordinates: Array<Array<Array<Point>>> };
};

/** Car streets, cycleways, and paths, minus anything closed to bikes, service alleys, and freeways. */
const isRideable = (tags: Record<string, string>) => {
  const highway = tags.highway ?? '';
  if (NO_ACCESS.has(tags.access ?? '') || tags.bicycle === 'no') {
    return false;
  }
  return (
    DRIVABLE.has(highway) ||
    highway === 'cycleway' ||
    highway === 'path' ||
    (SHARED_PATHS.has(highway) && BIKES_WELCOME.has(tags.bicycle ?? ''))
  );
};

const fetchJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, { ...init, redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response.json();
};

const fetchOverpass = async () => {
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      log.info('Fetching OSM streets', { mirror });
      return await fetchJson(mirror, {
        body: new URLSearchParams({ data: OVERPASS_QUERY }),
        method: 'POST',
      });
    } catch (error) {
      log.warn('Overpass mirror failed', { error: String(error), mirror });
    }
  }
  throw new Error('Every Overpass mirror failed');
};

const load = async (path: string | undefined, fallback: () => Promise<unknown>) =>
  path ? JSON.parse(await readFile(path, 'utf8')) : fallback();

const toGrid = ([lng, lat]: Point): Point => projectToGrid(ORIGIN, lat, lng);

const boxOf = (rings: ReadonlyArray<Ring>): Neighborhood['box'] => {
  const points = rings.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

/** Even-odd ray cast across every ring, so holes fall out. */
const contains = ({ box, rings }: Neighborhood, [x, y]: Point) => {
  if (x < box[0] || y < box[1] || x > box[2] || y > box[3]) {
    return false;
  }
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i] ?? [0, 0];
      const [xj, yj] = ring[j] ?? [0, 0];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
};

const distanceToSegment = ([x, y]: Point, [ax, ay]: Point, [bx, by]: Point) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t =
    dx === 0 && dy === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
};

const simplify = (points: Ring, tolerance: number): Ring => {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || points.length < 3) {
    return points;
  }
  let farthest = 0;
  let farthestIndex = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = distanceToSegment(points[i] ?? first, first, last);
    if (distance > farthest) {
      farthest = distance;
      farthestIndex = i;
    }
  }
  if (farthest <= tolerance) {
    return [first, last];
  }
  return [
    ...simplify(points.slice(0, farthestIndex + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(farthestIndex), tolerance),
  ];
};

/** One closed subpath per ring, first point absolute and the rest as relative steps. */
const toOutlinePath = (rings: ReadonlyArray<Ring>) =>
  rings
    .map((ring) =>
      simplify(ring, OUTLINE_TOLERANCE_METERS)
        .slice(0, -1)
        .map(
          ([x, y]): Point => [
            Math.round(x / OUTLINE_UNIT_METERS),
            Math.round(-y / OUTLINE_UNIT_METERS),
          ],
        ),
    )
    .map((ring) => {
      const [first] = ring;
      const steps = ring
        .slice(1)
        .map(([x, y], index) => [x - (ring[index]?.[0] ?? x), y - (ring[index]?.[1] ?? y)])
        .filter(([dx, dy]) => dx !== 0 || dy !== 0);
      return first && steps.length >= 2
        ? `M${first.join(' ')}l${steps.map((step) => step.join(' ')).join(' ')}z`
        : '';
    })
    .join('');

/** Resamples a way into evenly spaced whole-meter points about one piece apart. */
const resample = (points: ReadonlyArray<Point>): Array<Point> => {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1] ?? [0, 0];
    const [bx, by] = points[i] ?? [0, 0];
    lengths.push((lengths[i - 1] ?? 0) + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths.at(-1) ?? 0;
  const pieces = Math.max(1, Math.round(total / STREET_PIECE_METERS));
  const samples: Array<Point> = [];
  let segment = 1;
  for (let piece = 0; piece <= pieces; piece++) {
    const along = (total * piece) / pieces;
    while (segment < points.length - 1 && (lengths[segment] ?? 0) < along) {
      segment++;
    }
    const [ax, ay] = points[segment - 1] ?? [0, 0];
    const [bx, by] = points[segment] ?? [0, 0];
    const start = lengths[segment - 1] ?? 0;
    const span = (lengths[segment] ?? 0) - start;
    const t = span === 0 ? 0 : (along - start) / span;
    samples.push([Math.round(ax + t * (bx - ax)), Math.round(ay + t * (by - ay))]);
  }
  return samples;
};

const { values } = parseArgs({
  options: { neighborhoods: { type: 'string' }, osm: { type: 'string' } },
});
const geojson: { features: Array<GeoFeature> } = await load(values.neighborhoods, () =>
  fetchJson(NEIGHBORHOODS_URL),
);
const osm: { elements: Array<OsmWay> } = await load(values.osm, fetchOverpass);

const neighborhoods: Array<Neighborhood> = geojson.features
  .map(({ geometry, properties }) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    const rings = polygons.flat().map((ring) => ring.map(toGrid));
    return { box: boxOf(rings), name: properties.nhood, rings };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const runs = neighborhoods.map((): Array<string> => []);
let previousHood = 0;
const hoodOf = (point: Point) => {
  const previous = neighborhoods[previousHood];
  if (previous && contains(previous, point)) {
    return previousHood;
  }
  const found = neighborhoods.findIndex((hood) => contains(hood, point));
  previousHood = Math.max(0, found);
  return found;
};

for (const way of osm.elements) {
  if (way.type !== 'way' || !way.geometry || !isRideable(way.tags ?? {})) {
    continue;
  }
  const samples = resample(way.geometry.map(({ lat, lon }) => projectToGrid(ORIGIN, lat, lon)));
  let run: Array<Point> = [];
  let runHood = -1;
  const flush = () => {
    if (run.length > 1 && runHood >= 0) {
      runs[runHood]?.push(encodePolyline(run));
    }
    run = [];
  };
  for (let i = 1; i < samples.length; i++) {
    const [ax, ay] = samples[i - 1] ?? [0, 0];
    const [bx, by] = samples[i] ?? [0, 0];
    const hood = hoodOf([(ax + bx) / 2, (ay + by) / 2]);
    if (hood !== runHood) {
      flush();
      runHood = hood;
      run = [[ax, ay]];
    }
    run.push([bx, by]);
  }
  flush();
}

const outlines = neighborhoods.map(({ rings }) => toOutlinePath(rings));
const [minX, minY, maxX, maxY] = boxOf(neighborhoods.flatMap(({ rings }) => rings));
const viewBox = [
  Math.floor(minX / OUTLINE_UNIT_METERS),
  Math.floor(-maxY / OUTLINE_UNIT_METERS),
  Math.ceil((maxX - minX) / OUTLINE_UNIT_METERS),
  Math.ceil((maxY - minY) / OUTLINE_UNIT_METERS),
].join(' ');

/** A single-quoted literal, as Biome formats it. Polyline text can hold backslashes. */
const quote = (text: string) => `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

/** One property of a neighborhood entry, wrapped onto its own line past Biome's line width. */
const field = (key: string, value: string) => {
  const line = `      ${key}: ${quote(value)},`;
  return line.length > BIOME_LINE_WIDTH ? `      ${key}:\n        ${quote(value)},` : line;
};

const entries = neighborhoods.map(({ name }, index) =>
  [
    '    {',
    field('name', name),
    field('outline', outlines[index] ?? ''),
    field('streets', (runs[index] ?? []).join(' ')),
    '    },',
  ].join('\n'),
);
await writeFile(
  OUTPUT,
  `// Generated by \`turbo strava:sf-grid\` (packages/services/scripts/generateSfStreetGrid.ts). Do not edit.
import type { StreetGrid } from './streetGridGeometry';

export const SF_STREET_GRID: StreetGrid = {
  neighborhoods: [
${entries.join('\n')}
  ],
  origin: { lat: ${ORIGIN.lat}, lng: ${ORIGIN.lng} },
  viewBox: '${viewBox}',
};
`,
);
log.info('Wrote SF street grid', {
  neighborhoods: neighborhoods.length,
  runs: runs.flat().length,
});
