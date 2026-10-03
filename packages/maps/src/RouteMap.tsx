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
import { stadiaTileUrl, type TileSource } from './tileSource';

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
  tileSource,
  x,
  y,
  zoom,
}: {
  dark: boolean;
  dpr?: number;
  tileSource: TileSource;
  x: number;
  y: number;
  zoom: number;
}) {
  return stadiaTileUrl(tileSource, {
    dark,
    extension: 'png',
    retina: Boolean(dpr && dpr > 1),
    // Outdoors carries trails, contours and greenery, so it still reads as a map
    // under a scrim. Alidade Smooth Dark is the closest dark counterpart.
    style: dark ? 'alidade_smooth_dark' : 'outdoors',
    x,
    y,
    zoom,
  });
}

export type RouteMapProps = {
  points: Array<Point>;
  tileSource: TileSource;
  surface?: SiteSurface;
};

/** A non-interactive, theme-aware route map intended for card backgrounds. */
export function RouteMap({ points, tileSource, surface = 'classic' }: RouteMapProps) {
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
    tileUrl({ dark, dpr, tileSource, x, y, zoom });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    // borderBoxSize ignores ancestor transforms (rotated collage cards) but keeps
    // fractional pixels, unlike getBoundingClientRect or offsetWidth.
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (box && box.blockSize > 0 && box.inlineSize > 0) {
        setSize({ height: box.blockSize, width: box.inlineSize });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const containerSx: SxObject = {
    backgroundColor: tokens.containerBackground,
    height: '100%',
    // Groups the underlay, tiles, scrim and route into one layer so none of them
    // can paint above whatever the host renders over the map.
    isolation: 'isolate',
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'relative',
    width: '100%',
  };

  const tileLayerSx: SxObject = {
    // Pigeon paints its own opaque background, which would hide the placeholder.
    '& > div': {
      backgroundColor: 'transparent !important',
      // Pigeon re-measures its root with getBoundingClientRect, which grows under a
      // rotated collage card and feeds back into its own inline size every frame.
      ...(surface === 'classic' ? {} : { height: '100% !important', width: '100% !important' }),
    },
    filter: tokens.tileFilter,
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  };

  /**
   * A mild, near-uniform knock-back that sets how present the basemap feels.
   * Legibility is the host's job: whatever renders text over this map is expected
   * to back its own text regions, since only it knows where the copy sits.
   */
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
          tileSource,
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
