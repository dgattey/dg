'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import type { Point, TileComponentProps } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { type CSSProperties, use, useEffect, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import { OFFLINE_TILES } from './offlineTile';
import { RouteAtlasSketch } from './RouteAtlasSketch';
import { decodeRoutes, frameAround, framePaths, type GeoBounds, type MapRoute } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { stadiaTileUrl, type TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const MAX_MERCATOR_LATITUDE = 85.051_128_78;
const TILE_SIZE = 256;
const DEFAULT_SIZE = { height: 600, width: 800 };

const tileImageStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

function AtlasTile({ tile, tileLoaded }: TileComponentProps) {
  return (
    <div
      style={{
        height: tile.height,
        left: tile.left,
        opacity: tile.active ? 1 : 0,
        overflow: 'hidden',
        position: 'absolute',
        top: tile.top,
        transition: 'opacity 0.2s',
        width: tile.width,
      }}
    >
      <img
        alt=""
        loading="lazy"
        onLoad={tileLoaded}
        src={tile.url}
        srcSet={tile.srcSet}
        style={tileImageStyle}
      />
    </div>
  );
}

const containerSx: SxObject = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  willChange: 'transform',
};

const canvasSx: SxObject = {
  '& > svg': { display: 'block', height: '100%', width: '100%' },
  inset: 0,
  position: 'absolute',
};

const overlaySvgSx: SxObject = {
  display: 'block',
  height: '100%',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  width: '100%',
  zIndex: 2,
};

function projectMercator([latitude, longitude]: Point) {
  const clamped = Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, latitude));
  const radians = (clamped * Math.PI) / 180;
  return {
    x: (longitude + 180) / 360,
    y: (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2,
  };
}

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
  const hostRef = useRef<HTMLDivElement>(null);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const offline = tileSource.mode === 'offline';
  const activeBounds = view ?? bounds;
  const boundsKey = `${activeBounds[0][0]},${activeBounds[0][1]}:${activeBounds[1][0]},${activeBounds[1][1]}`;

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [viewportState, setViewportState] = useState<{
    boundsKey: string;
    center: Point;
    zoom: number;
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (offline || !host) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (box && box.blockSize > 0 && box.inlineSize > 0) {
        setSize({ height: Math.round(box.blockSize), width: Math.round(box.inlineSize) });
      }
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [offline]);

  const filteredRoutes = visible ? routes.filter(({ id }) => visible.has(id)) : routes;
  const baseFrame = frameAround(activeBounds, {
    height: size.height,
    padding: FIT_PADDING,
    width: size.width,
  });
  const customViewport = viewportState?.boundsKey === boundsKey ? viewportState : null;
  const activeCenter = customViewport?.center ?? baseFrame.center;
  const activeZoom = customViewport?.zoom ?? baseFrame.zoom;
  const paths = offline ? [] : framePaths(baseFrame, decodeRoutes(filteredRoutes));

  const scale = 2 ** (activeZoom - baseFrame.zoom);
  const worldScale = TILE_SIZE * 2 ** activeZoom;
  const baseMerc = projectMercator(baseFrame.center);
  const activeMerc = projectMercator(activeCenter);
  const translateX =
    size.width / 2 - (baseFrame.width / 2) * scale + (baseMerc.x - activeMerc.x) * worldScale;
  const translateY =
    size.height / 2 - (baseFrame.height / 2) * scale + (baseMerc.y - activeMerc.y) * worldScale;
  const groupTransform =
    customViewport === null
      ? undefined
      : `translate(${translateX.toFixed(2)} ${translateY.toFixed(2)}) scale(${scale.toFixed(5)})`;

  const zoomFactor = Math.max(0, Math.min(1, (activeZoom - 4) / (15 - 4)));
  const casingWidth = 2 + zoomFactor * 5;
  const lineWidth = 1 + zoomFactor * 2.5;
  const tokens = dark ? ROUTE_MAP_TOKENS.dark : ROUTE_MAP_TOKENS.light;
  const tileLayerSx: SxObject = {
    '& > div': {
      backgroundColor: 'transparent !important',
      height: '100% !important',
      width: '100% !important',
    },
    backgroundColor: tokens.background,
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  };

  return (
    <Box aria-label={label} ref={hostRef} role="region" sx={containerSx}>
      {offline ? (
        <Box
          sx={{
            ...canvasSx,
            backgroundImage: `url("${dark ? OFFLINE_TILES.dark : OFFLINE_TILES.light}")`,
          }}
        >
          <RouteAtlasSketch bounds={activeBounds} routes={filteredRoutes} />
        </Box>
      ) : (
        <>
          <Box sx={tileLayerSx}>
            <PigeonMapCore
              attribution={false}
              center={activeCenter}
              dprs={[1, 2]}
              height={size.height}
              maxZoom={MAX_ZOOM}
              metaWheelZoom={false}
              metaWheelZoomWarning=""
              minZoom={MIN_ZOOM}
              onBoundsChanged={({ center: nextCenter, zoom: nextZoom }) => {
                setViewportState({ boundsKey, center: nextCenter, zoom: nextZoom });
              }}
              provider={(x, y, tileZoom, dpr) =>
                stadiaTileUrl(tileSource, {
                  dark,
                  extension: 'png',
                  retina: Boolean(dpr && dpr > 1),
                  style: dark ? 'alidade_smooth_dark' : 'outdoors',
                  x,
                  y,
                  zoom: tileZoom,
                })
              }
              tileComponent={AtlasTile}
              twoFingerDrag={true}
              width={size.width}
              zoom={activeZoom}
              zoomSnap={false}
            />
          </Box>
          <Box
            aria-hidden="true"
            component="svg"
            preserveAspectRatio="xMidYMid slice"
            sx={overlaySvgSx}
            viewBox={`0 0 ${baseFrame.width} ${baseFrame.height}`}
          >
            <g transform={groupTransform}>
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
          </Box>
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
        </>
      )}
    </Box>
  );
}
