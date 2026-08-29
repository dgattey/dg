'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { SxObject } from '@dg/ui/theme';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { fitRouteViewport, projectRouteToPixels, toSvgPath } from './routeGeometry';
import { getRouteMapTokens } from './routeMapTokens';
import { SmoothTile } from './SmoothTile';

const ROUTE_PADDING = 42;
const DEFAULT_SIZE = 320;

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
  zIndex: 3,
};

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
  // Outdoors carries trails, contours and greenery, so it still reads as a map
  // under a scrim. Alidade Smooth Dark is the closest dark counterpart.
  const style = dark ? 'alidade_smooth_dark' : 'outdoors';
  const density = dpr && dpr > 1 ? '@2x' : '';
  return `https://tiles.stadiamaps.com/tiles/${style}/${zoom}/${x}/${y}${density}.png?api_key=${stadiaApiKey}`;
}

export type RouteMapProps = {
  points: Array<Point>;
  stadiaApiKey: string;
  surface?: SiteSurface;
};

/** A non-interactive, theme-aware route map intended for card backgrounds. */
export function RouteMap({ points, stadiaApiKey, surface = 'classic' }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ height: DEFAULT_SIZE, width: DEFAULT_SIZE });
  const { preference } = useColorScheme();
  const systemDark = useSyncExternalStore(
    subscribeToSystemDark,
    getSystemDarkSnapshot,
    getServerSystemDarkSnapshot,
  );
  const dark = preference === 'dark' || (preference === 'system' && systemDark);
  const tokens = getRouteMapTokens(surface, dark);
  const viewport = fitRouteViewport({
    height: size.height,
    padding: ROUTE_PADDING,
    points,
    width: size.width,
  });
  const underlayTile = tileCoordinates(viewport.center, viewport.zoom);
  const routePath = toSvgPath(
    projectRouteToPixels({
      center: viewport.center,
      height: size.height,
      points,
      width: size.width,
      zoom: viewport.zoom,
    }),
  );
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

  const containerSx: SxObject = {
    backgroundColor: tokens.containerBackground,
    height: '100%',
    isolation: 'isolate',
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'relative',
    width: '100%',
  };

  const tileLayerSx: SxObject = {
    '& > div': {
      backgroundColor: 'transparent !important',
    },
    filter: tokens.tileFilter,
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  };

  const scrimSx: SxObject = {
    background: tokens.scrimGradient,
    inset: 0,
    position: 'absolute',
    zIndex: 2,
  };

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
      <Box sx={tileLayerSx}>
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
        />
      </Box>
      <Box sx={scrimSx} />
      <Box component="svg" sx={routeSvgSx} viewBox={`0 0 ${size.width} ${size.height}`}>
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke={tokens.casingStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={6}
          vectorEffect="non-scaling-stroke"
        />
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke={tokens.routeStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={tokens.routeStrokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </Box>
    </Box>
  );
}
