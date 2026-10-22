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

/** `.maplibregl-map` forces `position: relative`, so the map container can't size by `inset`. */
const mapSx: SxObject = { height: '100%', width: '100%' };

const toLngLat = ([latitude, longitude]: Point): [number, number] => [longitude, latitude];

const lngLatBounds = ([southwest, northeast]: GeoBounds): [[number, number], [number, number]] => [
  toLngLat(southwest),
  toLngLat(northeast),
];

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

function showOnly(map: MapLibreMap, visible: ReadonlySet<number> | null) {
  for (const layer of [CASING_LAYER, LINE_LAYER]) {
    map.setFilter(layer, visible ? ['in', ['get', 'id'], ['literal', [...visible]]] : null);
  }
}

function addRoutes(map: MapLibreMap, host: HTMLElement, routes: ReadonlyArray<MapRoute>) {
  const colors = resolveTones(host, ['cream', ...new Set(routes.map(({ tone }) => tone))]);
  map.addSource(SOURCE, {
    data: {
      features: decodeRoutes(routes).map(({ id, points, tone }) => ({
        geometry: {
          coordinates: routeLegs(points).map((leg) => leg.map(toLngLat)),
          type: 'MultiLineString',
        },
        properties: { color: colors.get(tone), id },
        type: 'Feature',
      })),
      type: 'FeatureCollection',
    },
    type: 'geojson',
  });
  const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
  map.addLayer({
    id: CASING_LAYER,
    layout,
    paint: {
      'line-color': colors.get('cream') ?? 'white',
      'line-opacity': 0.75,
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 15, 6.5],
    },
    source: SOURCE,
    type: 'line',
  });
  map.addLayer({
    id: LINE_LAYER,
    layout,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 15, 3.5],
    },
    source: SOURCE,
    type: 'line',
  });
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const visible = use(VisibleRoutes);
  const visibleRef = useRef(visible);
  const dark = useDarkMap();
  const offline = tileSource.mode === 'offline';

  useEffect(() => {
    visibleRef.current = visible;
    const map = mapRef.current;
    if (map?.getLayer(LINE_LAYER)) {
      showOnly(map, visible);
    }
  }, [visible]);

  useEffect(() => {
    const host = canvasRef.current;
    if (offline || !host) {
      return;
    }
    let cancelled = false;
    let created: MapLibreMap | null = null;
    void import('maplibre-gl').then(({ Map: MapLibre, setWorkerUrl }) => {
      if (cancelled) {
        return;
      }
      // MapLibre finds its worker next to its own module, which bundling moves.
      setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);
      const map = new MapLibre({
        attributionControl: { compact: true },
        bounds: lngLatBounds(bounds),
        container: host,
        dragRotate: false,
        fitBoundsOptions: { padding: FIT_PADDING },
        maxPitch: 0,
        pitchWithRotate: false,
        rollEnabled: false,
        style: withStadiaKey(tileSource, stadiaStyleUrl(dark)),
        touchPitch: false,
        transformRequest: (url) => ({ url: withStadiaKey(tileSource, url) }),
      });
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      map.on('load', () => {
        addRoutes(map, host, routes);
        showOnly(map, visibleRef.current);
      });
      created = map;
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      created?.remove();
      mapRef.current = null;
    };
  }, [bounds, dark, offline, routes, tileSource]);

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
          <Box ref={canvasRef} sx={mapSx} />
          <ZoomControls
            onReset={() =>
              mapRef.current?.fitBounds(lngLatBounds(bounds), { padding: FIT_PADDING })
            }
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
          />
        </>
      )}
    </Box>
  );
}
