import {
  CARD_ROUTE_PADDING,
  decodePolyline,
  fitRouteViewport,
  projectRouteToPixels,
} from '../routeGeometry';
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

  it.each([
    { height: 900, name: 'desktop 16:9', width: 1600 },
    { height: 1200, name: 'mobile 4:3', width: 1600 },
  ])('covers the $name viewBox with terrain, not just the route bbox', ({ height, width }) => {
    const padding = Math.round((CARD_ROUTE_PADDING * width) / 460);
    const viewport = {
      ...fitRouteViewport({ height, padding, points: LOOP, width }),
      height,
      width,
    };
    const layers = buildTopoLayers(LOOP, viewport);
    const terrain = [
      ...layers.contours.flatMap((contour) => contour.line),
      ...layers.water.flatMap((body) => body.ring),
      ...layers.shore.flatMap((line) => line.line),
    ];
    const pixels = projectRouteToPixels({ ...viewport, points: terrain });
    const xs = pixels.map(({ x }) => x);
    const ys = pixels.map(({ y }) => y);
    expect(Math.min(...xs)).toBeLessThan(width * 0.04);
    expect(Math.max(...xs)).toBeGreaterThan(width * 0.96);
    expect(Math.min(...ys)).toBeLessThan(height * 0.04);
    expect(Math.max(...ys)).toBeGreaterThan(height * 0.96);
  });
});
