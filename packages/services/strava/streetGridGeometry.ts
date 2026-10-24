import 'server-only';

/** Where a flat meter grid is centered, in degrees. */
export type GridOrigin = { lat: number; lng: number };

/** Streets are cut into pieces about this long; a piece is ridden or it isn't. */
export const STREET_PIECE_METERS = 10;

/** Meters per `StreetGrid.viewBox` unit. */
export const OUTLINE_UNIT_METERS = 10;

/** A city's neighborhoods and the rideable streets in each, on a flat meter grid. */
export type StreetGrid = {
  origin: GridOrigin;
  /** SVG view box for every `outline`, in `OUTLINE_UNIT_METERS` with north up. */
  viewBox: string;
  neighborhoods: ReadonlyArray<{
    name: string;
    /** Simplified boundary as SVG path data in `viewBox` units. */
    outline: string;
    /**
     * Space-separated runs of points about `STREET_PIECE_METERS` apart, each
     * polyline-encoded in whole grid meters. Consecutive points bound one piece.
     */
    streets: string;
  }>;
};

const METERS_PER_DEGREE_LAT = 110_574;
const METERS_PER_DEGREE_LNG_AT_EQUATOR = 111_320;

/**
 * Degrees to meters east and north of `origin` on a flat grid. Across one city
 * the distortion is a fraction of a meter, well under GPS noise.
 */
export function projectToGrid(origin: GridOrigin, lat: number, lng: number): [number, number] {
  const lngScale = METERS_PER_DEGREE_LNG_AT_EQUATOR * Math.cos((origin.lat * Math.PI) / 180);
  return [(lng - origin.lng) * lngScale, (lat - origin.lat) * METERS_PER_DEGREE_LAT];
}

/** `projectToGrid` in outline units, so routes in degrees can be drawn over the outlines. */
export function outlineProjection(origin: GridOrigin) {
  const [lngMeters] = projectToGrid(origin, origin.lat, origin.lng + 1);
  const [, latMeters] = projectToGrid(origin, origin.lat + 1, origin.lng);
  return {
    origin,
    perDegree: { lat: -latMeters / OUTLINE_UNIT_METERS, lng: lngMeters / OUTLINE_UNIT_METERS },
  };
}

/**
 * Google's polyline encoding of integer pairs, delta from the previous pair.
 * Strava's polylines are degrees at 1e5; the street grid is whole meters.
 */
export function encodePolyline(points: ReadonlyArray<readonly [number, number]>) {
  let encoded = '';
  let previous: readonly [number, number] = [0, 0];
  for (const point of points) {
    for (const axis of [0, 1] as const) {
      const delta = point[axis] - previous[axis];
      let value = delta < 0 ? ~(delta << 1) : delta << 1;
      while (value >= 0x20) {
        encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
        value >>= 5;
      }
      encoded += String.fromCharCode(value + 63);
    }
    previous = point;
  }
  return encoded;
}

/** Decodes `encodePolyline` output, dividing each value by `scale`. Stops at a truncated pair. */
export function decodePolyline(encoded: string, scale = 1): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let index = 0;
  const pair = [0, 0];
  while (index < encoded.length) {
    for (const axis of [0, 1] as const) {
      let result = 0;
      let shift = 0;
      let byte = 0x20;
      while (byte >= 0x20) {
        if (index >= encoded.length) {
          return points;
        }
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      }
      pair[axis] = (pair[axis] ?? 0) + (result & 1 ? ~(result >> 1) : result >> 1);
    }
    points.push([(pair[0] ?? 0) / scale, (pair[1] ?? 0) / scale]);
  }
  return points;
}

const SIMPLIFY_DEGREES = 5e-4;
const COORDINATE_PRECISION = 1e4;
const STRAVA_POLYLINE_SCALE = 1e5;

function distanceToSegment(
  [px, py]: [number, number],
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  return Math.hypot(ax + t * dx - px, ay + t * dy - py);
}

/**
 * Simplifies a Strava degree polyline (`1e5` scale) with Douglas-Peucker at
 * `5e-4` degrees and `1e4` coordinate precision. Short or synthetic strings
 * with fewer than three points are returned unchanged.
 */
export function simplifySummaryPolyline(encoded: string): string {
  const points = decodePolyline(encoded, STRAVA_POLYLINE_SCALE).map(
    ([lat, lng]): [number, number] => [
      Math.round(lat * COORDINATE_PRECISION) / COORDINATE_PRECISION,
      Math.round(lng * COORDINATE_PRECISION) / COORDINATE_PRECISION,
    ],
  );
  if (points.length < 3) {
    return encoded;
  }
  const coordinates = points.map(([lat, lng]): [number, number] => [lng, lat]);
  const at = (index: number): [number, number] => coordinates[index] ?? [0, 0];
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const spans: Array<[number, number]> = [[0, points.length - 1]];
  for (let span = spans.pop(); span; span = spans.pop()) {
    const [start, end] = span;
    let farthest = -1;
    let farthestDistance = SIMPLIFY_DEGREES;
    for (let index = start + 1; index < end; index += 1) {
      const distance = distanceToSegment(at(index), at(start), at(end));
      if (distance > farthestDistance) {
        farthest = index;
        farthestDistance = distance;
      }
    }
    if (farthest !== -1) {
      keep[farthest] = 1;
      spans.push([start, farthest], [farthest, end]);
    }
  }
  return encodePolyline(
    points
      .filter((_, index) => keep[index] === 1)
      .map(([lat, lng]) => [
        Math.round(lat * STRAVA_POLYLINE_SCALE),
        Math.round(lng * STRAVA_POLYLINE_SCALE),
      ]),
  );
}
