import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import {
  decodeRoutes,
  frameAround,
  framePaths,
  type GeoBounds,
  type RouteFrame,
} from '@dg/maps/src/routeFrame';
import { projectRouteToPixels, toSvgPath } from '@dg/maps/src/routeGeometry';
import { formatCount } from '../music/stats/listeningStatsFormat';
import {
  formatCompactFeet,
  formatFeet,
  formatMiles,
  formatOutingDate,
  formatRouteCount,
} from '../activities/stravaFormat';
import { SPORT_DETAILS, toMapRoutes } from '../activities/stravaSports';
import type { PaperColor } from './SocialCardParts';
import {
  STRAVA_CARD_MAP_FRAME,
  type StravaCardVariant,
  type StravaMapTile,
} from './StravaSocialCard';
import { currentPacificYear, stripUnsupportedGlyphs } from './socialCardVariants';

const TILE_SIZE = 256;
const CLUSTER_RADIUS_DEG = 0.22;
const CLUSTER_QUANTILE = 0.04;

const DEFAULT_SF_BAY_BOUNDS: GeoBounds = [
  [37.685, -122.52],
  [37.865, -122.34],
];

type GeoPoint = GeoBounds[number];

const BAY_AREA_LAND_POLYGONS: ReadonlyArray<ReadonlyArray<GeoPoint>> = [
  [
    [37.81, -122.515],
    [37.812, -122.478],
    [37.808, -122.405],
    [37.788, -122.382],
    [37.708, -122.382],
    [37.6, -122.36],
    [37.45, -122.12],
    [37.45, -122.52],
    [37.65, -122.5],
  ],
  [
    [37.818, -122.535],
    [37.98, -122.68],
    [37.98, -122.45],
    [37.89, -122.43],
    [37.85, -122.475],
    [37.822, -122.478],
  ],
  [
    [37.98, -122.38],
    [37.9, -122.32],
    [37.82, -122.32],
    [37.8, -122.27],
    [37.73, -122.22],
    [37.6, -122.1],
    [37.45, -121.95],
    [37.45, -121.65],
    [37.98, -121.65],
  ],
];

function projectMercator([latitude, longitude]: GeoPoint) {
  const latitudeRadians = (latitude * Math.PI) / 180;
  return {
    x: (longitude + 180) / 360,
    y: (1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2,
  };
}

function quantileRange(values: Array<number>, q: number): [number, number] {
  const sorted = values.toSorted((a, b) => a - b);
  const idx = Math.floor(sorted.length * q);
  return [sorted[idx] ?? 0, sorted[sorted.length - 1 - idx] ?? 0];
}

function coreClusterBounds(history: StravaHistory | null): GeoBounds {
  if (!history) {
    return DEFAULT_SF_BAY_BOUNDS;
  }
  const decoded = decodeRoutes(toMapRoutes(history.outings));
  const starts = decoded.flatMap(({ points: [start] }) => (start ? [start] : []));
  if (starts.length === 0) {
    return DEFAULT_SF_BAY_BOUNDS;
  }
  const medianLat = quantileRange(
    starts.map(([lat]) => lat),
    0.5,
  )[0];
  const medianLng = quantileRange(
    starts.map(([, lng]) => lng),
    0.5,
  )[0];
  const clusterPoints = decoded.flatMap(({ points }) =>
    points.filter(
      ([lat, lng]) =>
        Math.abs(lat - medianLat) <= CLUSTER_RADIUS_DEG &&
        Math.abs(lng - medianLng) <= CLUSTER_RADIUS_DEG,
    ),
  );
  if (clusterPoints.length < 10) {
    return DEFAULT_SF_BAY_BOUNDS;
  }
  const [south, north] = quantileRange(
    clusterPoints.map(([lat]) => lat),
    CLUSTER_QUANTILE,
  );
  const [west, east] = quantileRange(
    clusterPoints.map(([, lng]) => lng),
    CLUSTER_QUANTILE,
  );
  return [
    [south - 0.012, west - 0.015],
    [north + 0.02, east + 0.015],
  ];
}

export type StravaTileCoord = {
  left: number;
  size: number;
  top: number;
  x: number;
  y: number;
  zoom: number;
};

export function computeStravaFrame(history: StravaHistory | null): RouteFrame {
  const rawFrame = frameAround(coreClusterBounds(history), STRAVA_CARD_MAP_FRAME);
  return {
    ...rawFrame,
    zoom: Math.round(rawFrame.zoom),
  };
}

export function computeStravaTileGrid(frame: RouteFrame): Array<StravaTileCoord> {
  const zoom = Math.round(frame.zoom);
  const scale = TILE_SIZE * 2 ** frame.zoom;
  const tileScale = 2 ** zoom;
  const tileSizePx = Math.ceil(TILE_SIZE * 2 ** (frame.zoom - zoom));
  const centerProj = projectMercator(frame.center);
  const minX = Math.floor((centerProj.x - frame.width / 2 / scale) * tileScale);
  const maxX = Math.floor((centerProj.x + frame.width / 2 / scale) * tileScale);
  const minY = Math.floor((centerProj.y - frame.height / 2 / scale) * tileScale);
  const maxY = Math.floor((centerProj.y + frame.height / 2 / scale) * tileScale);
  const tiles: Array<StravaTileCoord> = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      tiles.push({
        left: Math.round(((x / tileScale - centerProj.x) * scale + frame.width / 2) * 10) / 10,
        size: tileSizePx,
        top: Math.round(((y / tileScale - centerProj.y) * scale + frame.height / 2) * 10) / 10,
        x,
        y,
        zoom,
      });
    }
  }
  return tiles;
}

export function buildStravaCardVariant(
  history: StravaHistory | null,
  mapTiles: ReadonlyArray<StravaMapTile> = [],
): StravaCardVariant {
  const frame = computeStravaFrame(history);
  const landPaths = BAY_AREA_LAND_POLYGONS.map(
    (ring) => `${toSvgPath(projectRouteToPixels({ ...frame, points: [...ring] }))} Z`,
  );

  if (!history) {
    return {
      feetClimbed: '0',
      firstYear: currentPacificYear(),
      landPaths,
      latestKicker: null,
      latestTitle: null,
      mapTiles,
      miles: '0',
      outings: '0',
      recentStat: null,
      routeCountLabel: formatRouteCount(0),
      routePaths: [],
      variant: 'strava',
    };
  }

  const mapRoutes = toMapRoutes(history.outings);
  const decoded = decodeRoutes(mapRoutes);
  const routePaths = framePaths(frame, decoded).map(({ d, tone }) => ({
    d,
    tone: (tone as PaperColor) || 'cobalt',
  }));
  const latest = history.outings[0] ?? history.latest;
  const recentStat =
    latest.elevationGainMeters > 0
      ? `Latest: ${formatMiles(latest.distanceMeters)} mi · ${formatFeet(latest.elevationGainMeters)} ft`
      : `Latest: ${formatMiles(latest.distanceMeters)} mi`;
  const latestKicker = `LATEST ${SPORT_DETAILS[latest.sport].label.toUpperCase()} · ${formatOutingDate(latest.startDate).toUpperCase()}`;

  return {
    feetClimbed: formatCompactFeet(history.totals.elevationGainMeters),
    firstYear: history.totals.firstYear,
    landPaths,
    latestKicker,
    latestTitle: stripUnsupportedGlyphs(latest.name) || latest.name,
    mapTiles,
    miles: formatMiles(history.totals.distanceMeters),
    outings: formatCount(history.totals.outings),
    recentStat,
    routeCountLabel: formatRouteCount(mapRoutes.length),
    routePaths,
    variant: 'strava',
  };
}
