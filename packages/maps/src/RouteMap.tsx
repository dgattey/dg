'use client';

import type { SxObject } from '@dg/ui/theme';
import { BRAND } from '@dg/ui/theme/color';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { fitRouteViewport, projectRouteToPixels, toSvgPath } from './routeGeometry';
import { SmoothTile } from './SmoothTile';

const ROUTE_PADDING = 42;
const DEFAULT_SIZE = 320;

const paperMix = (percent: number) =>
  `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

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

const topoBasemapSx: SxObject = {
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%',
  zIndex: 0,
};

/** Invented outdoors theme used when Stadia tiles are unavailable. */
function TopoBasemap() {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      preserveAspectRatio="xMidYMid slice"
      sx={topoBasemapSx}
      viewBox="0 0 640 280"
    >
      <rect fill="#d4e0c8" height="280" width="640" />
      <path
        d="M0 210 C 70 190 110 240 180 200 C 250 155 280 230 360 210 C 440 188 500 240 640 200 L 640 280 L 0 280 Z"
        fill="#c3d4b4"
      />
      <path
        d="M220 40 C 280 20 340 70 400 48 C 460 24 520 80 600 56 L 620 120 C 520 150 430 90 360 118 C 290 146 240 90 180 112 Z"
        fill="#b7c8a6"
      />
      <path d="M0 0 L 210 0 C 160 40 90 20 0 70 Z" fill="#cfe0c2" />
      <path
        d="M0 250 C 90 230 140 270 230 248 C 310 226 360 268 640 236 L 640 280 L 0 280 Z"
        fill="#9fb392"
      />
      <path
        d="M40 200 C 90 170 130 210 180 186 C 230 160 270 204 330 176"
        fill="none"
        stroke="#7e9170"
        strokeWidth="1.1"
      />
      <path
        d="M260 150 C 310 120 360 158 420 132 C 480 104 530 150 600 128"
        fill="none"
        stroke="#7e9170"
        strokeWidth="1.1"
      />
      <path
        d="M300 70 C 340 50 380 86 430 64 C 480 42 530 78 580 60"
        fill="none"
        stroke="#8a9c7a"
        strokeWidth="1"
      />
      <path d="M80 90 C 130 60 170 110 230 82" fill="none" stroke="#8a9c7a" strokeWidth="1" />
      <ellipse cx="470" cy="96" fill="none" rx="54" ry="28" stroke="#7e9170" strokeWidth="1" />
      <ellipse cx="470" cy="96" fill="none" rx="34" ry="16" stroke="#7e9170" strokeWidth="0.9" />
      <ellipse cx="200" cy="168" fill="none" rx="70" ry="32" stroke="#7e9170" strokeWidth="1" />
    </Box>
  );
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

  const hasTiles = stadiaApiKey.length > 0;

  return (
    <Box aria-hidden="true" ref={containerRef} sx={containerSx}>
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
        <TopoBasemap />
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
      <Box sx={hasTiles ? getScrimSx(dark) : { ...getScrimSx(dark), opacity: 0.32 }} />
      <Box component="svg" sx={routeSvgSx} viewBox={`0 0 ${size.width} ${size.height}`}>
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke={dark ? 'rgb(0 0 0 / 0.42)' : paperMix(86)}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={hasTiles ? 6 : 8}
          vectorEffect="non-scaling-stroke"
        />
        <Box
          component="path"
          d={routePath}
          fill="none"
          stroke={BRAND.routeLine}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={hasTiles ? 2.5 : 4.5}
          vectorEffect="non-scaling-stroke"
        />
      </Box>
    </Box>
  );
}
