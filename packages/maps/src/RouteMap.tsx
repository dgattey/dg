'use client';

import type { SxObject } from '@dg/ui/theme';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { fitRouteViewport, projectRouteToPixels, toSvgPath } from './routeGeometry';
import { SmoothTile } from './SmoothTile';

const ROUTE_PADDING = 42;
const DEFAULT_SIZE = 320;
const STRAVA_ORANGE = '#fc4c02';

const containerSx: SxObject = {
  backgroundColor: 'var(--mui-palette-background-paper)',
  height: '100%',
  // Groups the underlay, tiles, scrim and route into one layer so none of them
  // can paint above whatever the host renders over the map.
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

const tileLayerSx: SxObject = {
  // Pigeon paints its own opaque background, which would hide the placeholder.
  '& > div': {
    backgroundColor: 'transparent !important',
  },
  // Mutes the basemap's landcover so the route and card copy lead, while roads,
  // trails and water still read as a map.
  filter: 'saturate(0.62)',
  inset: 0,
  position: 'absolute',
  zIndex: 1,
};

/**
 * Knocks the basemap back just far enough for the copy to win, weighted toward
 * the bottom where the densest text sits. Outdoors is a vivid, fully labelled
 * style so it needs more help than the already-muted dark basemap.
 */
const getScrimSx = (dark: boolean): SxObject => {
  const [top, middle, bottom] = dark ? ([16, 28, 44] as const) : ([32, 42, 55] as const);
  const paper = (percent: number) =>
    `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

  return {
    background: `linear-gradient(180deg, ${paper(top)} 0%, ${paper(middle)} 45%, ${paper(bottom)} 100%)`,
    inset: 0,
    position: 'absolute',
    zIndex: 2,
  };
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
      <Box sx={getScrimSx(dark)} />
      <Box component="svg" sx={routeSvgSx} viewBox={`0 0 ${size.width} ${size.height}`}>
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke="color-mix(in srgb, var(--mui-palette-background-paper) 78%, transparent)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={9}
          vectorEffect="non-scaling-stroke"
        />
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke={STRAVA_ORANGE}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4.5}
          vectorEffect="non-scaling-stroke"
        />
      </Box>
    </Box>
  );
}
