'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { use, useEffect, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import { drawRoutes, showOnly, toLngLat } from './atlasRouteLayers';
import { OFFLINE_TILES } from './offlineTile';
import { RouteAtlasSketch } from './RouteAtlasSketch';
import type { GeoBounds, MapRoute } from './routeFrame';
import { stadiaStyleUrl, type TileSource, withStadiaKey } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const FLY_MS = 900;

const containerSx: SxObject = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const canvasSx: SxObject = {
  '& > svg': { display: 'block', height: '100%', width: '100%' },
  inset: 0,
  position: 'absolute',
};

/** `.maplibregl-map` forces `position: relative`, so the map element can't size by `inset`. */
const hostSx: SxObject = { height: '100%', width: '100%' };

type Visible = ReadonlySet<number> | null;

/** What the mounted atlas asks the map to show. */
type Wanted = {
  dark: boolean;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  visible: Visible;
};

/**
 * The session's one MapLibre map. Unmounting parks its element instead of
 * removing the map, so coming back to the page shows the same canvas, view,
 * and loaded tiles at once rather than rebuilding them.
 */
type KeptAtlas = {
  drawn: ReadonlyArray<MapRoute> | null;
  element: HTMLDivElement;
  map: MapLibreMap;
  ready: boolean;
  styleDark: boolean;
};

let kept: KeptAtlas | null = null;
let creating: Promise<KeptAtlas> | null = null;
let wanted: Wanted | null = null;

const lngLatBounds = ([southwest, northeast]: GeoBounds): [[number, number], [number, number]] => [
  toLngLat(southwest),
  toLngLat(northeast),
];

const styleUrl = ({ dark, tileSource }: Wanted) => withStadiaKey(tileSource, stadiaStyleUrl(dark));

const sameRoutes = (a: ReadonlyArray<MapRoute> | null, b: ReadonlyArray<MapRoute>) =>
  a !== null &&
  a.length === b.length &&
  a.every(
    (route, index) =>
      route.id === b[index]?.id &&
      route.tone === b[index]?.tone &&
      route.polyline === b[index]?.polyline,
  );

/** Brings the kept map in line with what's wanted, changing only what differs. */
function apply(atlas: KeptAtlas) {
  const { element, map } = atlas;
  if (!wanted || !atlas.ready || !element.isConnected) {
    return;
  }
  if (atlas.styleDark !== wanted.dark) {
    atlas.ready = false;
    atlas.styleDark = wanted.dark;
    atlas.drawn = null;
    map.once('style.load', () => {
      atlas.ready = true;
      apply(atlas);
    });
    map.setStyle(styleUrl(wanted));
    return;
  }
  if (!sameRoutes(atlas.drawn, wanted.routes)) {
    drawRoutes(map, element, wanted.routes, wanted.dark);
    atlas.drawn = wanted.routes;
  }
  showOnly(map, wanted.visible);
}

/**
 * Builds the map inside `host` so it opens fitted to the host's real size, in
 * whichever theme is wanted once MapLibre has loaded.
 */
async function createAtlas(host: HTMLElement, bounds: GeoBounds, first: Wanted) {
  const { Map: MapLibre, setWorkerUrl } = await import('maplibre-gl');
  // MapLibre finds its worker next to its own module, which bundling moves.
  setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);
  const want = wanted ?? first;
  const element = document.createElement('div');
  element.style.height = '100%';
  element.style.width = '100%';
  host.append(element);
  const map = new MapLibre({
    attributionControl: { compact: true },
    bounds: lngLatBounds(bounds),
    container: element,
    dragRotate: false,
    fitBoundsOptions: { padding: FIT_PADDING },
    maxPitch: 0,
    pitchWithRotate: false,
    rollEnabled: false,
    style: styleUrl(want),
    touchPitch: false,
    trackResize: false,
    transformRequest: (url) => ({ url: withStadiaKey(want.tileSource, url) }),
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  const atlas: KeptAtlas = { drawn: null, element, map, ready: false, styleDark: want.dark };
  map.once('load', () => {
    atlas.ready = true;
    apply(atlas);
  });
  kept = atlas;
  return atlas;
}

type RouteAtlasMapProps = {
  bounds: GeoBounds;
  label: string;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  /** Where to fly once mounted, such as a region picked beside the map; `bounds` when null. */
  view?: GeoBounds | null;
};

/**
 * Every route on a pannable, zoomable Stadia vector map that opens on `bounds`.
 * MapLibre loads only in the browser and only for real tiles; offline it falls
 * back to a static sketch. `VisibleRoutes` above it picks which routes to ink.
 */
export function RouteAtlasMap({
  bounds,
  label,
  routes,
  tileSource,
  view = null,
}: RouteAtlasMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef(bounds);
  const flownRef = useRef(view);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const offline = tileSource.mode === 'offline';
  const [mapReady, setMapReady] = useState(() => Boolean(kept?.ready));

  useEffect(() => {
    wanted = { dark, routes, tileSource, visible };
    if (kept) {
      apply(kept);
    }
  }, [dark, routes, tileSource, visible]);

  useEffect(() => {
    if (flownRef.current === view) {
      return;
    }
    flownRef.current = view;
    kept?.map.fitBounds(lngLatBounds(view ?? bounds), { duration: FLY_MS, padding: FIT_PADDING });
  }, [bounds, view]);

  useEffect(() => {
    const host = hostRef.current;
    if (offline || !host || !wanted) {
      return;
    }
    let mounted = true;
    const markReadyWhenLoaded = (atlas: KeptAtlas) => {
      if (atlas.ready) {
        setMapReady(true);
        return;
      }
      atlas.map.once('load', () => {
        if (mounted) {
          setMapReady(true);
        }
      });
    };
    const attach = (atlas: KeptAtlas) => {
      if (!mounted) {
        return;
      }
      if (atlas.element.parentElement !== host) {
        host.append(atlas.element);
      }
      atlas.map.resize();
      apply(atlas);
      markReadyWhenLoaded(atlas);
    };
    if (kept) {
      attach(kept);
    } else {
      const initialWanted = wanted;
      const start = () => {
        if (!mounted) {
          return;
        }
        creating ??= createAtlas(host, boundsRef.current, wanted ?? initialWanted);
        void creating.then(attach);
      };
      const activeVt = (
        document as Document & { __reactViewTransition?: { finished: Promise<unknown> } }
      ).__reactViewTransition;
      if (activeVt) {
        void activeVt.finished.finally(start);
      } else {
        start();
      }
    }
    const observer = new ResizeObserver(() => {
      if (kept?.element.parentElement === host && host.clientWidth > 0) {
        kept.map.resize();
      }
    });
    observer.observe(host);
    return () => {
      mounted = false;
      observer.disconnect();
      if (kept?.element.parentElement === host) {
        kept.element.remove();
      }
    };
  }, [offline]);

  const showSketch = offline || !mapReady;

  return (
    <Box aria-label={label} role="region" sx={containerSx}>
      {showSketch ? (
        <Box
          sx={{
            ...canvasSx,
            backgroundImage: `url("${dark ? OFFLINE_TILES.dark : OFFLINE_TILES.light}")`,
          }}
        >
          <RouteAtlasSketch
            bounds={view ?? bounds}
            routes={visible ? routes.filter(({ id }) => visible.has(id)) : routes}
          />
        </Box>
      ) : null}
      {offline ? null : (
        <>
          <Box ref={hostRef} sx={hostSx} />
          <ZoomControls
            onReset={() =>
              kept?.map.fitBounds(lngLatBounds(view ?? bounds), { padding: FIT_PADDING })
            }
            onZoomIn={() => kept?.map.zoomIn()}
            onZoomOut={() => kept?.map.zoomOut()}
          />
        </>
      )}
    </Box>
  );
}
