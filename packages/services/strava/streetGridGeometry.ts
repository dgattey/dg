/** Where a flat meter grid is centered, in degrees. */
export type GridOrigin = { lat: number; lng: number };

/** Streets are cut into pieces about this long; a piece is ridden or it isn't. */
export const STREET_PIECE_METERS = 10;

/** A city's neighborhoods and the rideable streets in each, on a flat meter grid. */
export type StreetGrid = {
  origin: GridOrigin;
  /** SVG view box for every `outline`, in tens of meters with north up. */
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
