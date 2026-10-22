import { invariant } from '@dg/shared-core/assertions/invariant';
import rawGeography from './bayGeography.json' with { type: 'json' };
import { BAY_LABELS, type BayLabel } from './bayLabels';
import {
  type LatLon,
  type MercatorFrame,
  overlapsFrame,
  type Pixel,
  projection,
  snap,
  subpath,
} from './mercatorFrame';

/** Painted base layers as SVG path data, in the frame's pixel space. */
export type BayBase = {
  land: string;
  parks: string;
  lakes: string;
  /** Contour washes, outermost level first. */
  hills: ReadonlyArray<string>;
  bridges: string;
  goldenGate: string;
  goldenGateTowers: string;
  bridgeWidth: number;
  kmPx: number;
};

export type PlacedLabel = Omit<BayLabel, 'at'> & { x: number; y: number };

type Hill = { at: LatLon; radiusKm: number; stretch: Pixel; rotateDeg: number };

const HILL_LEVELS = 4;
const HILL_WOBBLE = 0.2;
const HILL_STEPS = 64;
const TOWER_POSITIONS = [0.18, 0.82] as const;

const toLatLon = (point: ReadonlyArray<number>): LatLon => {
  const [lat, lon] = point;
  invariant(lat !== undefined && lon !== undefined, 'Bay geography points are [lat, lon]');
  return [lat, lon];
};

const toRing = (ring: ReadonlyArray<ReadonlyArray<number>>) => ring.map(toLatLon);

const toHill = (row: ReadonlyArray<number>): Hill => {
  const [lat, lon, radiusKm, sx, sy, rotateDeg] = row;
  invariant(
    lat !== undefined &&
      lon !== undefined &&
      radiusKm !== undefined &&
      sx !== undefined &&
      sy !== undefined &&
      rotateDeg !== undefined,
    'Bay hills are [lat, lon, radius km, x stretch, y stretch, rotation]',
  );
  return { at: [lat, lon], radiusKm, rotateDeg, stretch: [sx, sy] };
};

const { goldenGate: goldenGatePoints, ...otherBridgePoints } = rawGeography.bridges;

const GEOGRAPHY = {
  bridges: Object.values(otherBridgePoints).map(toRing),
  goldenGate: toRing(goldenGatePoints),
  hills: rawGeography.hills.map(toHill),
  lakes: rawGeography.lakes.map(toRing),
  land: rawGeography.land.map(toRing),
  parks: rawGeography.parks.map(toRing),
};

function ringsPath(rings: ReadonlyArray<ReadonlyArray<Pixel>>, frame: MercatorFrame) {
  return rings
    .filter((ring) => ring.length > 2 && overlapsFrame(ring, frame))
    .map((ring) => subpath(snap(ring, 1, 1), 1, true))
    .join('');
}

const linePath = (line: ReadonlyArray<Pixel>) => subpath(snap(line, 10, 0.5), 10, false);

/** A wobbly ring around one hill mass; `level` 0 is the outermost. */
function hillRing(center: Pixel, radius: number, hill: Hill, index: number, level: number) {
  const angle = (hill.rotateDeg * Math.PI) / 180;
  return Array.from({ length: HILL_STEPS }, (_, step): Pixel => {
    const t = (step / HILL_STEPS) * Math.PI * 2;
    const wobble =
      1 +
      HILL_WOBBLE *
        (Math.sin(3 * t + index + level * 0.7) * 0.6 +
          Math.sin(5 * t + index * 2.1) * 0.3 +
          Math.sin(9 * t + level) * 0.12);
    const ex = Math.cos(t) * radius * hill.stretch[0] * wobble;
    const ey = Math.sin(t) * radius * hill.stretch[1] * wobble;
    return [
      center[0] + ex * Math.cos(angle) - ey * Math.sin(angle),
      center[1] + ex * Math.sin(angle) + ey * Math.cos(angle),
    ];
  });
}

const round = (value: number) => Math.round(value * 10) / 10;

function towersPath([start, end]: ReadonlyArray<Pixel>, bridgeWidth: number) {
  if (!start || !end) {
    return '';
  }
  return TOWER_POSITIONS.map((t) => {
    const x = round(start[0] + (end[0] - start[0]) * t - bridgeWidth * 1.6);
    const y = round(start[1] + (end[1] - start[1]) * t - bridgeWidth * 0.7);
    return `M${x} ${y}h${round(bridgeWidth * 3.2)}v${round(bridgeWidth * 1.4)}h${-round(bridgeWidth * 3.2)}z`;
  }).join('');
}

/** Projects the land, parks, lakes, hill contours, and bridges into the frame. */
export function bayBase(frame: MercatorFrame): BayBase {
  const { kmPx, project } = projection(frame);
  const projectAll = (rings: ReadonlyArray<ReadonlyArray<LatLon>>) =>
    rings.map((ring) => ring.map(project));
  const bridgeWidth = Math.max(1.6, Math.min(3.4, kmPx * 0.09));
  const goldenGate = GEOGRAPHY.goldenGate.map(project);
  const hills = Array.from({ length: HILL_LEVELS }, (_, level) =>
    ringsPath(
      GEOGRAPHY.hills.map((hill, index) =>
        hillRing(
          project(hill.at),
          hill.radiusKm * kmPx * (1 - level / (HILL_LEVELS + 0.4)),
          hill,
          index,
          level,
        ),
      ),
      frame,
    ),
  );
  return {
    bridges: projectAll(GEOGRAPHY.bridges).map(linePath).join(''),
    bridgeWidth,
    goldenGate: linePath(goldenGate),
    goldenGateTowers: towersPath(goldenGate, bridgeWidth),
    hills,
    kmPx,
    lakes: ringsPath(projectAll(GEOGRAPHY.lakes), frame),
    land: ringsPath(projectAll(GEOGRAPHY.land), frame),
    parks: ringsPath(projectAll(GEOGRAPHY.parks), frame),
  };
}

/** Whether the frame is centered on the painted geography, so a print there shows the Bay. */
export function inBayArea({ center: [lat, lon] }: MercatorFrame): boolean {
  const { e, n, s, w } = rawGeography.bounds;
  return lat >= s && lat <= n && lon >= w && lon <= e;
}

/** Labels whose anchor lands inside the frame, projected to pixels. */
export function placeLabels(frame: MercatorFrame): Array<PlacedLabel> {
  const { project } = projection(frame);
  return BAY_LABELS.flatMap(({ at, ...label }) => {
    const [x, y] = project(at);
    const inside = x >= 0 && x <= frame.width && y >= 0 && y <= frame.height;
    return inside ? [{ ...label, x: round(x), y: round(y) }] : [];
  });
}
