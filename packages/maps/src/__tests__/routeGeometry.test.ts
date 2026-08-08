import {
  decodePolyline,
  fitRouteViewport,
  projectRouteToPixels,
  toSvgPath,
} from '../routeGeometry';

describe('route geometry', () => {
  it('decodes the canonical Google polyline fixture', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]);
  });

  it('rejects a truncated encoded value', () => {
    expect(() => decodePolyline('_')).toThrow('Invalid encoded polyline');
  });

  it('fits every route point inside the requested padding', () => {
    const points = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    const width = 320;
    const height = 280;
    const padding = 40;
    const viewport = fitRouteViewport({ height, padding, points, width });

    for (const { x, y } of projectRouteToPixels({ ...viewport, height, points, width })) {
      expect(x).toBeGreaterThanOrEqual(padding - 0.001);
      expect(x).toBeLessThanOrEqual(width - padding + 0.001);
      expect(y).toBeGreaterThanOrEqual(padding - 0.001);
      expect(y).toBeLessThanOrEqual(height - padding + 0.001);
    }
  });

  it('centers a single-point route and renders it as a one-command path', () => {
    const points = decodePolyline('_p~iF~ps|U');
    const pixels = projectRouteToPixels({
      center: points[0] as [number, number],
      height: 200,
      points,
      width: 300,
      zoom: 15,
    });

    expect(pixels).toEqual([{ x: 150, y: 100 }]);
    expect(toSvgPath(pixels)).toBe('M150.00 100.00');
  });

  it('uses a close zoom for a single-point route', () => {
    expect(
      fitRouteViewport({
        height: 300,
        padding: 40,
        points: [[47.6062, -122.3321]],
        width: 300,
      }),
    ).toEqual({ center: [47.6062, -122.3321], zoom: 15 });
  });
});
