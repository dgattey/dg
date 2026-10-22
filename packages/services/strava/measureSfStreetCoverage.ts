import 'server-only';

import {
  type SfCoverageSpan,
  type SfCoverageSport,
  type SfStreetCoverage,
  STRAVA_WINDOW_DAYS,
  sfCoverageKey,
} from '@dg/content-models/strava/SfStreetCoverage';
import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import { SF_STREET_GRID } from './sfStreetGrid';
import { decodePolyline, projectToGrid, type StreetGrid } from './streetGridGeometry';

/** A street piece counts as ridden when a route passes within this many meters of its middle... */
const REACH_METERS = 20;
/** ...heading along it, not across it. Summary polylines cut corners, so this is loose. */
const MAX_HEADING_GAP_COS = Math.cos((35 * Math.PI) / 180);
const DAY_MS = 24 * 60 * 60 * 1000;
const STRAVA_POLYLINE_SCALE = 1e5;

type Segment = { x: number; y: number; headX: number; headY: number; length: number };

type Pieces = {
  count: number;
  hood: Uint8Array;
  length: Float64Array;
  /** Middle of each piece. */
  midX: Float64Array;
  midY: Float64Array;
  /** Unit heading of each piece. */
  headX: Float64Array;
  headY: Float64Array;
  /** `REACH_METERS` square cells over every piece, one cell of margin on each side. */
  cells: { originX: number; originY: number; columns: number; rows: number };
  /** Pieces sorted by cell; cell `c` holds `cellPieces[cellStart[c]..cellStart[c + 1]]`. */
  cellStart: Int32Array;
  cellPieces: Int32Array;
};

function cutIntoPieces(grid: StreetGrid): Pieces {
  const runs = grid.neighborhoods.map(({ streets }) =>
    streets ? streets.split(' ').map((run) => decodePolyline(run)) : [],
  );
  const count = runs.flat().reduce((sum, run) => sum + Math.max(0, run.length - 1), 0);
  const hood = new Uint8Array(count);
  const length = new Float64Array(count);
  const midX = new Float64Array(count);
  const midY = new Float64Array(count);
  const headX = new Float64Array(count);
  const headY = new Float64Array(count);
  let index = 0;
  runs.forEach((hoodRuns, hoodIndex) => {
    for (const run of hoodRuns) {
      for (let i = 1; i < run.length; i++) {
        const [ax, ay] = run[i - 1] ?? [0, 0];
        const [bx, by] = run[i] ?? [0, 0];
        const pieceLength = Math.hypot(bx - ax, by - ay);
        hood[index] = hoodIndex;
        length[index] = pieceLength;
        midX[index] = (ax + bx) / 2;
        midY[index] = (ay + by) / 2;
        headX[index] = pieceLength ? (bx - ax) / pieceLength : 0;
        headY[index] = pieceLength ? (by - ay) / pieceLength : 0;
        index++;
      }
    }
  });
  const cellOf = (value: number) => Math.floor(value / REACH_METERS);
  const lowest = (values: Float64Array) => values.reduce((low, value) => Math.min(low, value), 0);
  const highest = (values: Float64Array) =>
    values.reduce((high, value) => Math.max(high, value), 0);
  const originX = cellOf(lowest(midX)) - 1;
  const originY = cellOf(lowest(midY)) - 1;
  const columns = cellOf(highest(midX)) - originX + 2;
  const rows = cellOf(highest(midY)) - originY + 2;
  const pieceCell = new Int32Array(count);
  const cellStart = new Int32Array(columns * rows + 1);
  for (let piece = 0; piece < count; piece++) {
    const cell =
      (cellOf(midY[piece] ?? 0) - originY) * columns + cellOf(midX[piece] ?? 0) - originX;
    pieceCell[piece] = cell;
    cellStart[cell + 1] = (cellStart[cell + 1] ?? 0) + 1;
  }
  for (let cell = 1; cell < cellStart.length; cell++) {
    cellStart[cell] = (cellStart[cell] ?? 0) + (cellStart[cell - 1] ?? 0);
  }
  const filled = cellStart.slice(0, -1);
  const cellPieces = new Int32Array(count);
  for (let piece = 0; piece < count; piece++) {
    const cell = pieceCell[piece] ?? 0;
    cellPieces[filled[cell] ?? 0] = piece;
    filled[cell] = (filled[cell] ?? 0) + 1;
  }
  return {
    cellPieces,
    cellStart,
    cells: { columns, originX, originY, rows },
    count,
    headX,
    headY,
    hood,
    length,
    midX,
    midY,
  };
}

const piecesByGrid = new WeakMap<StreetGrid, Pieces>();

const piecesOf = (grid: StreetGrid) => {
  const pieces = piecesByGrid.get(grid) ?? cutIntoPieces(grid);
  piecesByGrid.set(grid, pieces);
  return pieces;
};

/**
 * Indices of the street pieces each route rides along. Each route segment is
 * walked a cell at a time, checking the 3×3 cells around each step once.
 */
function piecesRidden(
  grid: StreetGrid,
  pieces: Pieces,
  outings: ReadonlyArray<StravaLogEntry>,
): Array<Array<number>> {
  const { columns, originX, originY, rows } = pieces.cells;
  const lastRoute = new Int32Array(pieces.count).fill(-1);
  const lastSegment = new Int32Array(pieces.count).fill(-1);
  const cellSegment = new Int32Array(columns * rows).fill(-1);
  let segment = 0;
  const visit = (cell: number, route: number, ridden: Array<number>, along: Segment) => {
    if (cellSegment[cell] === segment) {
      return;
    }
    cellSegment[cell] = segment;
    const end = pieces.cellStart[cell + 1] ?? 0;
    for (let slot = pieces.cellStart[cell] ?? 0; slot < end; slot++) {
      const piece = pieces.cellPieces[slot] ?? 0;
      if (lastRoute[piece] === route || lastSegment[piece] === segment) {
        continue;
      }
      lastSegment[piece] = segment;
      const alignment = Math.abs(
        along.headX * (pieces.headX[piece] ?? 0) + along.headY * (pieces.headY[piece] ?? 0),
      );
      if (alignment < MAX_HEADING_GAP_COS) {
        continue;
      }
      const offsetX = (pieces.midX[piece] ?? 0) - along.x;
      const offsetY = (pieces.midY[piece] ?? 0) - along.y;
      const t = Math.max(0, Math.min(along.length, offsetX * along.headX + offsetY * along.headY));
      if (Math.hypot(offsetX - along.headX * t, offsetY - along.headY * t) <= REACH_METERS) {
        lastRoute[piece] = route;
        ridden.push(piece);
      }
    }
  };
  return outings.map((outing, route) => {
    const ridden: Array<number> = [];
    const points = outing.polyline
      ? decodePolyline(outing.polyline, STRAVA_POLYLINE_SCALE).map(([lat, lng]) =>
          projectToGrid(grid.origin, lat, lng),
        )
      : [];
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i - 1] ?? [0, 0];
      const [toX, toY] = points[i] ?? [0, 0];
      const length = Math.hypot(toX - x, toY - y);
      if (length === 0) {
        continue;
      }
      const along: Segment = { headX: (toX - x) / length, headY: (toY - y) / length, length, x, y };
      segment++;
      const steps = Math.ceil(length / REACH_METERS);
      for (let step = 0; step <= steps; step++) {
        const reached = Math.min(step * REACH_METERS, length);
        const column = Math.floor((x + along.headX * reached) / REACH_METERS) - originX;
        const row = Math.floor((y + along.headY * reached) / REACH_METERS) - originY;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const atColumn = column + dx;
            const atRow = row + dy;
            if (atColumn >= 0 && atRow >= 0 && atColumn < columns && atRow < rows) {
              visit(atRow * columns + atColumn, route, ridden, along);
            }
          }
        }
      }
    }
    return ridden;
  });
}

const spansOf = (outing: StravaLogEntry, now: number): Array<SfCoverageSpan> => {
  const start = Date.parse(outing.startDate);
  const windows = (
    Object.keys(STRAVA_WINDOW_DAYS) as Array<keyof typeof STRAVA_WINDOW_DAYS>
  ).filter((window) => start >= now - STRAVA_WINDOW_DAYS[window] * DAY_MS);
  return ['all', new Date(start).getUTCFullYear(), ...windows];
};

const sportsOf = ({ sport }: StravaLogEntry): Array<SfCoverageSport> =>
  sport === 'other' ? ['all'] : ['all', sport];

/**
 * Street coverage measured against `grid` for every sport and span the
 * `/strava` filters offer. A piece ridden by several outings counts once.
 */
export function measureStreetCoverage(
  grid: StreetGrid,
  outings: ReadonlyArray<StravaLogEntry>,
  now: Date,
): SfStreetCoverage {
  const pieces = piecesOf(grid);
  const ridden = piecesRidden(grid, pieces, outings);
  const groups = new Map<string, Array<number>>();
  outings.forEach((outing, index) => {
    if (ridden[index]?.length) {
      for (const sport of sportsOf(outing)) {
        for (const span of spansOf(outing, now.getTime())) {
          const key = sfCoverageKey(sport, span);
          const group = groups.get(key);
          if (group) {
            group.push(index);
          } else {
            groups.set(key, [index]);
          }
        }
      }
    }
  });
  const seen = new Uint8Array(pieces.count);
  const metersPerHood = (members: ReadonlyArray<number>) => {
    seen.fill(0);
    const meters = grid.neighborhoods.map(() => 0);
    for (const member of members) {
      for (const piece of ridden[member] ?? []) {
        if (!seen[piece]) {
          seen[piece] = 1;
          const hood = pieces.hood[piece] ?? 0;
          meters[hood] = (meters[hood] ?? 0) + (pieces.length[piece] ?? 0);
        }
      }
    }
    return meters.map(Math.round);
  };
  const streetMeters = grid.neighborhoods.map(() => 0);
  for (let piece = 0; piece < pieces.count; piece++) {
    const hood = pieces.hood[piece] ?? 0;
    streetMeters[hood] = (streetMeters[hood] ?? 0) + (pieces.length[piece] ?? 0);
  }
  return {
    neighborhoods: grid.neighborhoods.map(({ name, outline }, index) => ({
      name,
      outline,
      streetMeters: Math.round(streetMeters[index] ?? 0),
    })),
    ridden: Object.fromEntries([...groups].map(([key, members]) => [key, metersPerHood(members)])),
    viewBox: grid.viewBox,
  };
}

export const measureSfStreetCoverage = (outings: ReadonlyArray<StravaLogEntry>, now: Date) =>
  measureStreetCoverage(SF_STREET_GRID, outings, now);
