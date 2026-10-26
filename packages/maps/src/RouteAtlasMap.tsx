'use client';

import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { use, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import { RouteSvgPaths } from './RouteSvgPaths';
import {
  type DecodedRoute,
  decodeRoutes,
  type FramedPath,
  frameAround,
  type GeoBounds,
  type MapRoute,
  MERCATOR_REF_ZOOM,
  mercatorPaths,
  mercatorRefPoint,
} from './routeFrame';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DEFAULT_SIZE = { height: 600, width: 800 };

type AtlasRoutesOverlayProps = {
  center: Point;
  dark: boolean;
  height: number;
  left?: number;
  mapState?: { center: Point; height: number; width: number; zoom: number };
  paths: ReadonlyArray<FramedPath>;
  top?: number;
  width: number;
  zoom: number;
};

export function AtlasRoutesOverlay({
  center,
  dark,
  height,
  left,
  mapState,
  paths,
  top,
  width,
  zoom,
}: AtlasRoutesOverlayProps) {
  const liveCenter = mapState?.center ?? center;
  const liveZoom = mapState?.zoom ?? zoom;
  const liveWidth = mapState?.width ?? width;
  const liveHeight = mapState?.height ?? height;
  const centerRef = mercatorRefPoint(liveCenter);
  const scale = 2 ** (liveZoom - MERCATOR_REF_ZOOM);
  const cx = left ?? liveWidth / 2;
  const cy = top ?? liveHeight / 2;
  const translateX = cx - centerRef.x * scale;
  const translateY = cy - centerRef.y * scale;
  const zoomFactor = Math.max(0, Math.min(1, (liveZoom - 4) / (15 - 4)));
  const casingWidth = 2 + zoomFactor * 5;
  const lineWidth = 1 + zoomFactor * 2.5;

  return (
    <svg aria-hidden="true" data-atlas-overlay="">
      <g
        transform={`translate(${translateX.toFixed(2)} ${translateY.toFixed(2)}) scale(${scale.toFixed(6)})`}
      >
        <RouteSvgPaths
          casingOpacity={0.8}
          casingStroke={dark ? 'var(--black)' : 'var(--cream)'}
          casingWidth={casingWidth}
          lineWidth={lineWidth}
          paths={paths}
        />
      </g>
    </svg>
  );
}

type ViewportSnapshot = {
  boundsKey: string;
  center: Point;
  zoom: number;
};

type RouteAtlasMapProps = {
  bounds: GeoBounds;
  fitKey?: number;
  label: string;
  onCenterChange?: (center: Point) => void;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  view?: GeoBounds | null;
};

const visibleKeyOf = (visible: ReadonlySet<number> | null) =>
  visible ? [...visible].toSorted((a, b) => a - b).join(',') : '*';

export function RouteAtlasMap({
  bounds,
  fitKey = 0,
  label,
  onCenterChange,
  routes,
  tileSource,
  view = null,
}: RouteAtlasMapProps) {
  const hostRef = useRef<HTMLElement>(null);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const activeBounds = view ?? bounds;
  const boundsKey = `${fitKey}:${activeBounds[0][0]},${activeBounds[0][1]}:${activeBounds[1][0]},${activeBounds[1][1]}`;

  const size = useHostSize(hostRef, DEFAULT_SIZE, { round: true });
  const [viewportState, setViewportState] = useState<ViewportSnapshot | null>(null);

  const decodedRef = useRef<{ decoded: Array<DecodedRoute>; routes: typeof routes } | null>(null);
  if (!decodedRef.current || decodedRef.current.routes !== routes) {
    decodedRef.current = { decoded: decodeRoutes(routes), routes };
  }
  const pathsRef = useRef<{
    paths: Array<FramedPath>;
    routes: typeof routes;
    visible: typeof visible;
    visibleKey: string;
  } | null>(null);
  if (
    !pathsRef.current ||
    pathsRef.current.routes !== routes ||
    pathsRef.current.visible !== visible
  ) {
    const visibleKey = visibleKeyOf(visible);
    if (
      !pathsRef.current ||
      pathsRef.current.routes !== routes ||
      pathsRef.current.visibleKey !== visibleKey
    ) {
      const decoded = decodedRef.current.decoded;
      const filtered = visible ? decoded.filter(({ id }) => visible.has(id)) : decoded;
      pathsRef.current = { paths: mercatorPaths(filtered), routes, visible, visibleKey };
    } else {
      pathsRef.current.visible = visible;
    }
  }

  const defaultFrame = frameAround(activeBounds, {
    height: size.height,
    padding: FIT_PADDING,
    width: size.width,
  });
  const customViewport = viewportState?.boundsKey === boundsKey ? viewportState : null;
  const activeCenter = customViewport?.center ?? defaultFrame.center;
  const activeZoom = customViewport?.zoom ?? defaultFrame.zoom;
  const paths = pathsRef.current.paths;

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      <div data-atlas-tiles="" data-dark={dark ? 'true' : undefined}>
        <PigeonMapCore
          attribution={false}
          center={activeCenter}
          defaultCenter={defaultFrame.center}
          defaultHeight={DEFAULT_SIZE.height}
          defaultWidth={DEFAULT_SIZE.width}
          defaultZoom={defaultFrame.zoom}
          dprs={[1, 2]}
          maxZoom={MAX_ZOOM}
          metaWheelZoom={false}
          metaWheelZoomWarning=""
          minZoom={MIN_ZOOM}
          onBoundsChanged={({ center: nextCenter, initial, zoom: nextZoom }) => {
            if (initial) {
              return;
            }
            setViewportState({ boundsKey, center: nextCenter, zoom: nextZoom });
            onCenterChange?.(nextCenter);
          }}
          provider={(x, y, tileZoom, dpr) =>
            outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tileZoom })
          }
          tileComponent={SmoothTile}
          twoFingerDrag={true}
          zoom={activeZoom}
          zoomSnap={false}
        >
          <AtlasRoutesOverlay
            center={activeCenter}
            dark={dark}
            height={size.height}
            paths={paths}
            width={size.width}
            zoom={activeZoom}
          />
        </PigeonMapCore>
      </div>
      <ZoomControls
        onReset={() => setViewportState(null)}
        onZoomIn={() =>
          setViewportState({
            boundsKey,
            center: activeCenter,
            zoom: Math.min(MAX_ZOOM, activeZoom + 1),
          })
        }
        onZoomOut={() =>
          setViewportState({
            boundsKey,
            center: activeCenter,
            zoom: Math.max(MIN_ZOOM, activeZoom - 1),
          })
        }
      />
    </section>
  );
}
