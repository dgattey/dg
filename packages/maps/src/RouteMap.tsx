'use client';

import type { SxObject } from '@dg/ui/theme';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Box } from '@mui/material';
import type { PigeonProps, Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { fitRouteViewport } from './routeGeometry';
import { SmoothTile } from './SmoothTile';

const ROUTE_PADDING = 42;
const DEFAULT_SIZE = 320;

const containerSx: SxObject = {
  // Pigeon's root is the tile layer's own stacking level; keep it above the
  // placeholder underlay instead of relying on DOM order.
  '& > div': {
    backgroundColor: 'transparent !important',
    position: 'relative',
    zIndex: 1,
  },
  backgroundColor: 'var(--mui-palette-background-paper)',
  height: '100%',
  // Groups the underlay, tiles and route into one layer so none of them can
  // paint above whatever the host renders over the map.
  isolation: 'isolate',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'relative',
  width: '100%',
};

const underlaySx: SxObject = {
  filter: 'blur(8px)',
  height: '110%',
  inset: '-5%',
  objectFit: 'cover',
  opacity: 0.7,
  position: 'absolute',
  transform: 'scale(1.05)',
  width: '110%',
  zIndex: 0,
};

const routeSvgSx: SxObject = {
  height: '100%',
  left: 0,
  overflow: 'visible',
  position: 'absolute',
  top: 0,
  width: '100%',
};

type RouteOverlayProps = PigeonProps & {
  points: Array<Point>;
};

function RouteOverlay({ latLngToPixel, mapState, points }: RouteOverlayProps) {
  if (!latLngToPixel || !mapState || mapState.width <= 0 || mapState.height <= 0) {
    return null;
  }

  const path = points
    .map((point, index) => {
      const [x, y] = latLngToPixel(point);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <Box
      aria-hidden="true"
      component="svg"
      sx={routeSvgSx}
      viewBox={`0 0 ${mapState.width} ${mapState.height}`}
    >
      <Box
        component="path"
        d={path}
        fill="none"
        stroke="color-mix(in srgb, var(--mui-palette-background-default) 85%, transparent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={8}
        vectorEffect="non-scaling-stroke"
      />
      <Box
        component="path"
        d={path}
        fill="none"
        stroke="#fc4c02"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}

const subscribeToSystemDark = (onStoreChange: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
};

const getSystemDarkSnapshot = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const getServerSystemDarkSnapshot = () => false;

function tileCoordinates([latitude, longitude]: Point, zoom: number) {
  const tileZoom = Math.round(zoom);
  const scale = 2 ** tileZoom;
  const latitudeRadians = (latitude * Math.PI) / 180;
  return {
    x: Math.floor(((longitude + 180) / 360) * scale),
    y: Math.floor(
      ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) *
        scale,
    ),
    zoom: tileZoom,
  };
}

function tileUrl({
  dark,
  dpr,
  stadiaApiKey,
  x,
  y,
  zoom,
}: {
  dark: boolean;
  dpr?: number;
  stadiaApiKey: string;
  x: number;
  y: number;
  zoom: number;
}) {
  const style = dark ? 'alidade_smooth_dark' : 'alidade_smooth';
  const density = dpr && dpr > 1 ? '@2x' : '';
  return `https://tiles.stadiamaps.com/tiles/${style}/${zoom}/${x}/${y}${density}.png?api_key=${stadiaApiKey}`;
}

export type RouteMapProps = {
  points: Array<Point>;
  stadiaApiKey: string;
};

/** A non-interactive, theme-aware route map intended for card backgrounds. */
export function RouteMap({ points, stadiaApiKey }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ height: DEFAULT_SIZE, width: DEFAULT_SIZE });
  const { preference } = useColorScheme();
  const systemDark = useSyncExternalStore(
    subscribeToSystemDark,
    getSystemDarkSnapshot,
    getServerSystemDarkSnapshot,
  );
  const dark = preference === 'dark' || (preference === 'system' && systemDark);
  const viewport = fitRouteViewport({
    height: size.height,
    padding: ROUTE_PADDING,
    points,
    width: size.width,
  });
  const underlayTile = tileCoordinates(viewport.center, viewport.zoom);
  const provider = (x: number, y: number, zoom: number, dpr?: number) =>
    tileUrl({ dark, dpr, stadiaApiKey, x, y, zoom });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect();
      if (height > 0 && width > 0) {
        setSize({ height, width });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Box aria-hidden="true" ref={containerRef} sx={containerSx}>
      <Box
        alt=""
        component="img"
        src={tileUrl({
          dark,
          stadiaApiKey,
          x: underlayTile.x,
          y: underlayTile.y,
          zoom: underlayTile.zoom,
        })}
        sx={underlaySx}
      />
      <PigeonMapCore
        animate={false}
        attribution={false}
        center={viewport.center}
        dprs={[1, 2]}
        height={size.height}
        // Pigeon only reads width/height in its constructor, so remount on resize.
        key={`${Math.round(size.width)}x${Math.round(size.height)}`}
        mouseEvents={false}
        provider={provider}
        tileComponent={SmoothTile}
        touchEvents={false}
        width={size.width}
        zoom={viewport.zoom}
        zoomSnap={false}
      >
        <RouteOverlay points={points} />
      </PigeonMapCore>
    </Box>
  );
}
