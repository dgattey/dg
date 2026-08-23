'use client';

import type { SxObject } from '@dg/ui/theme';
import { BRAND } from '@dg/ui/theme/color';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  CARD_ROUTE_PADDING,
  fitRouteViewport,
  projectRouteToPixels,
  toSvgPath,
} from './routeGeometry';
import { SmoothTile } from './SmoothTile';
import { TopoBasemap } from './TopoBasemap';

const DEFAULT_SIZE = 320;

const paperMix = (percent: number) =>
  `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

const containerSx: SxObject = {
  '[data-greenhouse-frame] &': {
    '--route-casing': '#fff8ec',
    '--route-casing-width': 7,
    '--route-line': '#f0701a',
    '--route-line-filter': 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.25))',
    '--route-stroke-width': 4,
    backgroundColor: 'transparent',
  },
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

const getTileLayerSx = (dark: boolean): SxObject => ({
  // Pigeon paints its own opaque background, which would hide the placeholder.
  '& > div': {
    backgroundColor: 'transparent !important',
  },
  // Outdoors is vivid and fully labelled, so light mode also lifts its darkest
  // ink — road casings and place labels — toward the landcover. Without that the
  // basemap's own labels, not the route, become the worst thing under the copy.
  filter: dark ? 'saturate(0.85)' : 'saturate(0.5) brightness(1.1) contrast(0.76)',
  inset: 0,
  position: 'absolute',
  zIndex: 1,
});

/**
 * A mild, near-uniform knock-back that sets how present the basemap feels.
 * Legibility is the host's job: whatever renders text over this map is expected
 * to back its own text regions, since only it knows where the copy sits.
 */
const getScrimSx = (dark: boolean): SxObject => {
  const [top, bottom] = dark ? ([10, 20] as const) : ([20, 28] as const);

  return {
    background: `linear-gradient(180deg, ${paperMix(top)} 0%, ${paperMix(bottom)} 100%)`,
    inset: 0,
    opacity: 'var(--map-scrim-opacity)',
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
    padding: CARD_ROUTE_PADDING,
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

  const hasTiles = stadiaApiKey.length > 0;
  const routeVars: SxObject = {
    '--map-scrim-opacity': hasTiles ? 1 : 0.32,
    '--route-casing': dark ? 'rgb(0 0 0 / 0.42)' : paperMix(86),
    '--route-casing-width': hasTiles ? 6 : 8,
    '--route-line': BRAND.routeLine,
    '--route-line-filter': 'none',
    '--route-stroke-width': hasTiles ? 2.5 : 4.5,
  };

  return (
    <Box aria-hidden="true" ref={containerRef} sx={{ ...containerSx, ...routeVars }}>
      {hasTiles ? (
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
      ) : (
        <TopoBasemap
          center={viewport.center}
          height={size.height}
          points={points}
          width={size.width}
          zoom={viewport.zoom}
        />
      )}
      {hasTiles ? (
        <Box sx={getTileLayerSx(dark)}>
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
      ) : null}
      <Box sx={getScrimSx(dark)} />
      <Box component="svg" sx={routeSvgSx} viewBox={`0 0 ${size.width} ${size.height}`}>
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke="var(--route-casing)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="var(--route-casing-width)"
          vectorEffect="non-scaling-stroke"
        />
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke="var(--route-line)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="var(--route-stroke-width)"
          sx={{ filter: 'var(--route-line-filter, none)' }}
          vectorEffect="non-scaling-stroke"
        />
      </Box>
    </Box>
  );
}
