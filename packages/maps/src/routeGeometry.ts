import type { Point } from 'pigeon-maps';

const TILE_SIZE = 256;
const MAX_MERCATOR_LATITUDE = 85.051_128_78;
const DEFAULT_ROUTE_ZOOM = 15;

export type ProjectedPoint = {
  x: number;
  y: number;
};

export type RouteViewport = {
  center: Point;
  zoom: number;
};

function decodeValue(encoded: string, startIndex: number) {
  let index = startIndex;
  let result = 0;
  let shift = 0;

  while (index < encoded.length) {
    const byte = encoded.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
    if (byte < 0x20) {
      const value = result & 1 ? ~(result >> 1) : result >> 1;
      return { index, value };
    }
  }

  throw new Error('Invalid encoded polyline');
}

/** Decodes a Google encoded polyline into latitude/longitude points. */
export function decodePolyline(encoded: string): Array<Point> {
  const points: Array<Point> = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const latitudeValue = decodeValue(encoded, index);
    const longitudeValue = decodeValue(encoded, latitudeValue.index);
    index = longitudeValue.index;
    latitude += latitudeValue.value;
    longitude += longitudeValue.value;
    points.push([latitude / 1e5, longitude / 1e5]);
  }

  return points;
}

function encodeValue(value: number) {
  let remaining = value < 0 ? ~(value << 1) : value << 1;
  let encoded = '';
  while (remaining >= 0x20) {
    encoded += String.fromCharCode((0x20 | (remaining & 0x1f)) + 63);
    remaining >>= 5;
  }
  return encoded + String.fromCharCode(remaining + 63);
}

/** Encodes latitude/longitude points as a Google encoded polyline, the inverse of `decodePolyline`. */
export function encodePolyline(points: ReadonlyArray<Point>) {
  let encoded = '';
  let previousLatitude = 0;
  let previousLongitude = 0;
  for (const [latitude, longitude] of points) {
    const scaledLatitude = Math.round(latitude * 1e5);
    const scaledLongitude = Math.round(longitude * 1e5);
    encoded +=
      encodeValue(scaledLatitude - previousLatitude) +
      encodeValue(scaledLongitude - previousLongitude);
    previousLatitude = scaledLatitude;
    previousLongitude = scaledLongitude;
  }
  return encoded;
}

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
 * Douglas-Peucker: drops every point that sits within `tolerance` of the line
 * its neighbors already draw. `toXY` picks the plane the tolerance is measured in.
 */
export function simplifyLine<T>(
  points: ReadonlyArray<T>,
  tolerance: number,
  toXY: (point: T) => [number, number],
): Array<T> {
  if (points.length < 3) {
    return [...points];
  }
  const coordinates = points.map(toXY);
  const at = (index: number): [number, number] => coordinates[index] ?? [0, 0];
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const spans: Array<[number, number]> = [[0, points.length - 1]];
  for (let span = spans.pop(); span; span = spans.pop()) {
    const [start, end] = span;
    let farthest = -1;
    let farthestDistance = tolerance;
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
  return points.filter((_, index) => keep[index] === 1);
}

function project([latitude, longitude]: Point): ProjectedPoint {
  const clampedLatitude = Math.max(
    -MAX_MERCATOR_LATITUDE,
    Math.min(MAX_MERCATOR_LATITUDE, latitude),
  );
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;

  return {
    x: (longitude + 180) / 360,
    y: (1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2,
  };
}

function unproject({ x, y }: ProjectedPoint): Point {
  const longitude = x * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - 2 * y)));
  return [(latitudeRadians * 180) / Math.PI, longitude];
}

/**
 * Fits route bounds to a Web Mercator viewport with an even pixel inset.
 * Pigeon uses the same 256px slippy-map projection.
 */
export function fitRouteViewport({
  height,
  maxZoom = 18,
  minZoom = 1,
  padding,
  points,
  width,
}: {
  height: number;
  maxZoom?: number;
  minZoom?: number;
  padding: number;
  points: Array<Point>;
  width: number;
}): RouteViewport {
  if (points.length === 0) {
    return { center: [0, 0], zoom: minZoom };
  }

  const projected = points.map(project);
  const xs = projected.map(({ x }) => x);
  const ys = projected.map(({ y }) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const availableWidth = Math.max(width - padding * 2, 1);
  const availableHeight = Math.max(height - padding * 2, 1);
  const longitudeZoom =
    maxX === minX ? DEFAULT_ROUTE_ZOOM : Math.log2(availableWidth / (TILE_SIZE * (maxX - minX)));
  const latitudeZoom =
    maxY === minY ? DEFAULT_ROUTE_ZOOM : Math.log2(availableHeight / (TILE_SIZE * (maxY - minY)));
  const zoom = Math.max(
    minZoom,
    Math.min(maxZoom, DEFAULT_ROUTE_ZOOM, longitudeZoom, latitudeZoom),
  );

  return {
    center: unproject({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }),
    zoom,
  };
}

/**
 * Maps route points onto viewport pixels using the same 256px slippy-map
 * projection Pigeon uses, so the overlay can live outside the map instead of
 * depending on Pigeon's own projection callback.
 */
export function projectRouteToPixels({
  center,
  height,
  points,
  width,
  zoom,
}: {
  center: Point;
  height: number;
  points: Array<Point>;
  width: number;
  zoom: number;
}): Array<ProjectedPoint> {
  const scale = TILE_SIZE * 2 ** zoom;
  const projectedCenter = project(center);

  return points.map((point) => {
    const projected = project(point);
    return {
      x: (projected.x - projectedCenter.x) * scale + width / 2,
      y: (projected.y - projectedCenter.y) * scale + height / 2,
    };
  });
}

/** Builds an SVG path command string from already-projected route pixels. */
export function toSvgPath(pixels: Array<ProjectedPoint>) {
  return pixels
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
}
