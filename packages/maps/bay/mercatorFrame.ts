import { invariant } from '@dg/shared-core/assertions/invariant';

export type LatLon = readonly [lat: number, lon: number];

export type Pixel = readonly [x: number, y: number];

/** A Web Mercator window: `lonSpan` degrees of longitude across `width` pixels, centered on `center`. */
export type MercatorFrame = {
  center: LatLon;
  lonSpan: number;
  width: number;
  height: number;
};

const EARTH_CIRCUMFERENCE_KM = 40_075;
const SINGLE_POINT_LON_SPAN = 0.01;

const mercatorX = (lon: number) => (lon + 180) / 360;

const mercatorY = (lat: number) => {
  const radians = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2;
};

const latitudeAt = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

/** Projects [lat, lon] into the frame's pixels; `kmPx` is pixels per kilometer at its center. */
export function projection({ center, height, lonSpan, width }: MercatorFrame) {
  const scale = width / (lonSpan / 360);
  const cx = mercatorX(center[1]);
  const cy = mercatorY(center[0]);
  return {
    kmPx: scale / (EARTH_CIRCUMFERENCE_KM * Math.cos((center[0] * Math.PI) / 180)),
    project: ([lat, lon]: LatLon): Pixel => [
      (mercatorX(lon) - cx) * scale + width / 2,
      (mercatorY(lat) - cy) * scale + height / 2,
    ],
  };
}

/** Fits points into a width x height frame, leaving `padding` pixels on the tighter axis. */
export function frameAround(
  points: ReadonlyArray<LatLon>,
  width: number,
  height: number,
  padding: number,
): MercatorFrame {
  invariant(points.length > 0, 'A frame needs at least one point');
  const xs = points.map(([, lon]) => mercatorX(lon));
  const ys = points.map(([lat]) => mercatorY(lat));
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const scale = Math.min(
    Math.max(1, width - padding * 2) / (maxX - minX),
    Math.max(1, height - padding * 2) / (maxY - minY),
  );
  return {
    center: [latitudeAt((minY + maxY) / 2), ((minX + maxX) / 2) * 360 - 180],
    height,
    lonSpan: Number.isFinite(scale) ? (width / scale) * 360 : SINGLE_POINT_LON_SPAN,
    width,
  };
}

/** Rounds pixels onto a grid of `1 / unitsPerPx`, dropping steps shorter than `minStep` pixels. */
export function snap(pixels: ReadonlyArray<Pixel>, unitsPerPx: number, minStep: number) {
  const snapped: Array<Pixel> = [];
  let last: Pixel | null = null;
  for (const [x, y] of pixels) {
    const point: Pixel = [Math.round(x * unitsPerPx), Math.round(y * unitsPerPx)];
    if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < minStep * unitsPerPx) {
      continue;
    }
    snapped.push(point);
    last = point;
  }
  return snapped;
}

const joinNumbers = (values: ReadonlyArray<number>) =>
  values.reduce<string>(
    (out, value, index) => (index === 0 || value < 0 ? `${out}${value}` : `${out} ${value}`),
    '',
  );

/** Path data for snapped points: one absolute move, then relative lines. */
export function subpath(run: ReadonlyArray<Pixel>, unitsPerPx: number, close: boolean) {
  const [first, ...rest] = run;
  if (!first || rest.length === 0) {
    return '';
  }
  const deltas: Array<number> = [];
  let last = first;
  for (const point of rest) {
    deltas.push((point[0] - last[0]) / unitsPerPx, (point[1] - last[1]) / unitsPerPx);
    last = point;
  }
  const move = joinNumbers([first[0] / unitsPerPx, first[1] / unitsPerPx]);
  return `M${move}l${joinNumbers(deltas)}${close ? 'z' : ''}`;
}

/** Whether the points' bounding box touches the frame, give or take `margin` pixels. */
export function overlapsFrame(
  pixels: ReadonlyArray<Pixel>,
  { height, width }: MercatorFrame,
  margin = 2,
) {
  const xs = pixels.map(([x]) => x);
  const ys = pixels.map(([, y]) => y);
  return (
    Math.max(...xs) >= -margin &&
    Math.min(...xs) <= width + margin &&
    Math.max(...ys) >= -margin &&
    Math.min(...ys) <= height + margin
  );
}
