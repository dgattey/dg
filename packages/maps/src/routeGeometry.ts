import type { Point } from 'pigeon-maps';

const TILE_SIZE = 256;
const MAX_MERCATOR_LATITUDE = 85.051_128_78;
const DEFAULT_ROUTE_ZOOM = 15;

type ProjectedPoint = {
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
