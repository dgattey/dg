'use client';

import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { type CSSProperties, use, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import { OFFLINE_TILES } from './offlineTile';
import { RouteAtlasSketch } from './RouteAtlasSketch';
import {
  decodeRoutes,
  type FramedPath,
  frameAround,
  framePaths,
  type GeoBounds,
  type MapRoute,
  type RouteFrame,
} from './routeFrame';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const TILE_SIZE = 256;
const DEFAULT_SIZE = { height: 600, width: 800 };
const REPROJECT_ZOOM_DELTA = 0.75;
const REPROJECT_PAN_FRACTION = 0.5;

type AtlasRoutesOverlayProps = {
  anchor: Point;
  baseFrame: RouteFrame;
  dark: boolean;
  left?: number;
  mapState?: { center: Point; height: number; width: number; zoom: number };
  paths: ReadonlyArray<FramedPath>;
  top?: number;
};

function AtlasRoutesOverlay({
  baseFrame,
  dark,
  left,
  mapState,
  paths,
  top,
}: AtlasRoutesOverlayProps) {
  const liveZoom = mapState?.zoom ?? baseFrame.zoom;
  const cx = left ?? baseFrame.width / 2;
  const cy = top ?? baseFrame.height / 2;
  const scale = 2 ** (liveZoom - baseFrame.zoom);
  const translateX = cx - (baseFrame.width / 2) * scale;
  const translateY = cy - (baseFrame.height / 2) * scale;
  const zoomFactor = Math.max(0, Math.min(1, (liveZoom - 4) / (15 - 4)));
  const casingWidth = 2 + zoomFactor * 5;
  const lineWidth = 1 + zoomFactor * 2.5;

  return (
    <svg aria-hidden="true" data-atlas-overlay="">
      <g
        transform={`translate(${translateX.toFixed(2)} ${translateY.toFixed(2)}) scale(${scale.toFixed(6)})`}
      >
        {paths.map(({ d, tone }) => (
          <path
            d={d}
            fill="none"
            key={`casing-${tone}`}
            stroke={dark ? 'var(--black)' : 'var(--cream)'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.8}
            strokeWidth={casingWidth}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {paths.map(({ d, tone }) => (
          <path
            d={d}
            data-tone={tone}
            fill="none"
            key={tone}
            stroke={`var(--${tone})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={lineWidth}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}

function pixelSeparation(a: Point, b: Point, zoom: number): number {
  const worldScale = TILE_SIZE * 2 ** zoom;
  const dx = ((a[1] - b[1]) / 360) * worldScale;
  const dy = ((b[0] - a[0]) / 360) * worldScale;
  return Math.hypot(dx, dy);
}

type ViewportSnapshot = {
  boundsKey: string;
  center: Point;
  zoom: number;
};

type RouteAtlasMapProps = {
  bounds: GeoBounds;
  label: string;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  view?: GeoBounds | null;
};

export function RouteAtlasMap({
  bounds,
  label,
  routes,
  tileSource,
  view = null,
}: RouteAtlasMapProps) {
  const hostRef = useRef<HTMLElement>(null);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const offline = tileSource.mode === 'offline';
  const activeBounds = view ?? bounds;
  const boundsKey = `${activeBounds[0][0]},${activeBounds[0][1]}:${activeBounds[1][0]},${activeBounds[1][1]}`;

  const size = useHostSize(hostRef, DEFAULT_SIZE, { disabled: offline, round: true });
  const [viewportState, setViewportState] = useState<ViewportSnapshot | null>(null);
  const [projectedViewport, setProjectedViewport] = useState<ViewportSnapshot | null>(null);

  const filteredRoutes = visible ? routes.filter(({ id }) => visible.has(id)) : routes;
  const defaultFrame = frameAround(activeBounds, {
    height: size.height,
    padding: FIT_PADDING,
    width: size.width,
  });
  const customViewport = viewportState?.boundsKey === boundsKey ? viewportState : null;
  const activeCenter = customViewport?.center ?? defaultFrame.center;
  const activeZoom = customViewport?.zoom ?? defaultFrame.zoom;

  const settledProjection = projectedViewport?.boundsKey === boundsKey ? projectedViewport : null;
  const baseFrame: RouteFrame = settledProjection
    ? {
        center: settledProjection.center,
        height: size.height,
        width: size.width,
        zoom: settledProjection.zoom,
      }
    : defaultFrame;
  const frameMargin = Math.max(size.width, size.height);
  const paths = offline ? [] : framePaths(baseFrame, decodeRoutes(filteredRoutes), frameMargin);

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      {offline ? (
        <div
          data-atlas-canvas=""
          style={
            {
              '--atlas-offline-bg': `url("${dark ? OFFLINE_TILES.dark : OFFLINE_TILES.light}")`,
            } as CSSProperties
          }
        >
          <RouteAtlasSketch bounds={activeBounds} routes={filteredRoutes} />
        </div>
      ) : (
        <>
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
                const zoomShift = Math.abs(nextZoom - baseFrame.zoom);
                const panPixels = pixelSeparation(nextCenter, baseFrame.center, nextZoom);
                const panThreshold = Math.min(size.width, size.height) * REPROJECT_PAN_FRACTION;
                if (zoomShift >= REPROJECT_ZOOM_DELTA || panPixels >= panThreshold) {
                  setProjectedViewport({ boundsKey, center: nextCenter, zoom: nextZoom });
                }
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
                anchor={baseFrame.center}
                baseFrame={baseFrame}
                dark={dark}
                paths={paths}
              />
            </PigeonMapCore>
          </div>
          <ZoomControls
            onReset={() => {
              setViewportState(null);
              setProjectedViewport(null);
            }}
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
        </>
      )}
    </section>
  );
}
