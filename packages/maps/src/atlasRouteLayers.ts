import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Point } from 'pigeon-maps';
import { decodeRoutes, type MapRoute, routeLegs } from './routeFrame';

const SOURCE = 'routes';
const CASING_LAYER = 'route-casing';
const LINE_LAYER = 'route-line';

export const toLngLat = ([latitude, longitude]: Point): [number, number] => [longitude, latitude];

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

export function showOnly(map: MapLibreMap, visible: ReadonlySet<number> | null) {
  for (const layer of [CASING_LAYER, LINE_LAYER]) {
    map.setFilter(layer, visible ? ['in', ['get', 'id'], ['literal', [...visible]]] : null);
  }
}

/** A paper casing under each line: cream on the light basemap, black on the dark one. */
export function drawRoutes(
  map: MapLibreMap,
  host: HTMLElement,
  routes: ReadonlyArray<MapRoute>,
  dark: boolean,
) {
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
