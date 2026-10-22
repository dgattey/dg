'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Point } from 'pigeon-maps';
import { use, useEffect, useRef } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import { OFFLINE_TILES } from './offlineTile';
import { RouteAtlasSketch } from './RouteAtlasSketch';
import { decodeRoutes, type GeoBounds, type MapRoute, routeLegs } from './routeFrame';
import { stadiaStyleUrl, type TileSource, withStadiaKey } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const SOURCE = 'routes';
const CASING_LAYER = 'route-casing';
const LINE_LAYER = 'route-line';

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

const toLngLat = ([latitude, longitude]: Point): [number, number] => [longitude, latitude];

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

/**
 * Paper tones are `light-dark()` pairs, which only resolve to a color on an
 * element. Each tone gets a fresh probe: restyling one probe can report the
 * previous tone's color.
 */
function resolveTones(host: HTMLElement, tones: Iterable<string>) {
  const colors = new Map<string, string>();
  for (const tone of tones) {
    const probe = document.createElement('span');
    probe.style.color = `var(--${tone})`;
    host.append(probe);
    colors.set(tone, getComputedStyle(probe).color);
    probe.remove();
  }
  return colors;
}

function showOnly(map: MapLibreMap, visible: Visible) {
  for (const layer of [CASING_LAYER, LINE_LAYER]) {
    map.setFilter(layer, visible ? ['in', ['get', 'id'], ['literal', [...visible]]] : null);
  }
}

/** A paper casing under each line: cream on the light basemap, black on the dark one. */
function drawRoutes(map: MapLibreMap, host: HTMLElement, { dark, routes }: Wanted) {
  const casing = dark ? 'black' : 'cream';
  const colors = resolveTones(host, [casing, ...new Set(routes.map(({ tone }) => tone))]);
  const data = {
    features: decodeRoutes(routes).map(({ id, points, tone }) => ({
      geometry: {
        coordinates: routeLegs(points).map((leg) => leg.map(toLngLat)),
        type: 'MultiLineString' as const,
      },
      properties: { color: colors.get(tone), id },
      type: 'Feature' as const,
    })),
    type: 'FeatureCollection' as const,
  };
  const source = map.getSource(SOURCE);
  if (source?.type === 'geojson' && 'setData' in source) {
    (source as { setData: (next: typeof data) => void }).setData(data);
    return;
  }
  map.addSource(SOURCE, { data, type: 'geojson' });
  const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
  map.addLayer({
    id: CASING_LAYER,
    layout,
    paint: {
      'line-color': colors.get(casing) ?? 'white',
      'line-opacity': 0.8,
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 15, 7],
    },
    source: SOURCE,
    type: 'line',
  });
  map.addLayer({
    id: LINE_LAYER,
    layout,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 15, 3.5],
    },
    source: SOURCE,
    type: 'line',
  });
}

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
    drawRoutes(map, element, wanted);
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

export type RouteAtlasMapProps = {
  bounds: GeoBounds;
  label: string;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
};

/**
 * Every route on a pannable, zoomable Stadia vector map that opens on `bounds`.
 * MapLibre loads only in the browser and only for real tiles; offline it falls
 * back to a static sketch. `VisibleRoutes` above it picks which routes to ink.
 */
export function RouteAtlasMap({ bounds, label, routes, tileSource }: RouteAtlasMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef(bounds);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const offline = tileSource.mode === 'offline';

  useEffect(() => {
    wanted = { dark, routes, tileSource, visible };
    if (kept) {
      apply(kept);
    }
  }, [dark, routes, tileSource, visible]);

  useEffect(() => {
    const host = hostRef.current;
    if (offline || !host || !wanted) {
      return;
    }
    let mounted = true;
    const attach = (atlas: KeptAtlas) => {
      if (!mounted) {
        return;
      }
      if (atlas.element.parentElement !== host) {
        host.append(atlas.element);
      }
      atlas.map.resize();
      apply(atlas);
    };
    if (kept) {
      attach(kept);
    } else {
      creating ??= createAtlas(host, boundsRef.current, wanted);
      void creating.then(attach);
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

  useEffect(() => {
    wanted = { dark, routes, tileSource, visible };
    if (kept) {
      apply(kept);
    }
  }, [dark, routes, tileSource, visible]);

  return (
    <Box aria-label={label} role="region" sx={containerSx}>
      {offline ? (
        <Box
          sx={{
            ...canvasSx,
            backgroundImage: `url("${dark ? OFFLINE_TILES.dark : OFFLINE_TILES.light}")`,
          }}
        >
          <RouteAtlasSketch
            bounds={bounds}
            routes={visible ? routes.filter(({ id }) => visible.has(id)) : routes}
          />
        </Box>
      ) : (
        <>
          <Box ref={hostRef} sx={hostSx} />
          <ZoomControls
            onReset={() => kept?.map.fitBounds(lngLatBounds(bounds), { padding: FIT_PADDING })}
            onZoomIn={() => kept?.map.zoomIn()}
            onZoomOut={() => kept?.map.zoomOut()}
          />
        </>
      )}
    </Box>
  );
}
