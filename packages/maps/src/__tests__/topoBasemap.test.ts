import { decodePolyline } from '../routeGeometry';
import {
  buildTopoLayers,
  routeBounds,
  routeCentroid,
  seedFromBounds,
  TOPO_LAND,
} from '../topoBasemap';

const LOOP = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');

describe('topoBasemap', () => {
  it('is deterministic for a given route bbox', () => {
    const first = buildTopoLayers(LOOP);
    const second = buildTopoLayers(LOOP);
    expect(first).toEqual(second);
    expect(first.land).toBe(TOPO_LAND);
    expect(first.water.length).toBeGreaterThan(0);
    expect(first.contours.length).toBeGreaterThanOrEqual(12);
    expect(first.canopy.length).toBeGreaterThan(0);
    expect(first.shore.length).toBeGreaterThan(0);
  });

  it('marks every fourth iso as an index contour', () => {
    const index = buildTopoLayers(LOOP).contours.filter((contour) => contour.strokeWidth === 1.5);
    expect(index.length).toBeGreaterThan(0);
  });

  it('keeps the same seed for the same bounds', () => {
    expect(seedFromBounds(routeBounds(LOOP))).toBe(seedFromBounds(routeBounds(LOOP)));
  });

  it('keeps a water edge inside the route bbox so the card can see it', () => {
    const tight = routeBounds(LOOP);
    const layers = buildTopoLayers(LOOP);
    const coastLngs = layers.water[0]?.ring.map(([, lng]) => lng) ?? [];
    expect(coastLngs.some((lng) => lng >= tight.minLng && lng <= tight.maxLng)).toBe(true);
  });

  it('places water on the side away from the route centroid', () => {
    const layers = buildTopoLayers(LOOP);
    const [lat, lng] = routeCentroid(LOOP);
    const waterLngs = layers.water[0]?.ring
      .filter(([ringLat]) => Math.abs(ringLat - lat) < 0.4)
      .map(([, ringLng]) => ringLng);
    expect(waterLngs?.length).toBeGreaterThan(0);
    const waterMean =
      (waterLngs?.reduce((sum, value) => sum + value, 0) ?? 0) / (waterLngs?.length ?? 1);
    expect(Math.abs(waterMean - lng)).toBeGreaterThan(0.2);
  });
});
