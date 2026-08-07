import type { Point } from 'pigeon-maps';
import { decodePolyline, fitRouteViewport } from '../routeGeometry';

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

    const worldPixel = ([latitude, longitude]: Point): Point => {
      const scale = 256 * 2 ** viewport.zoom;
      const latitudeRadians = (latitude * Math.PI) / 180;
      return [
        ((longitude + 180) / 360) * scale,
        ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) *
          scale,
      ];
    };
    const centerPixel = worldPixel(viewport.center);

    for (const point of points) {
      const pixel = worldPixel(point);
      const x = pixel[0] - centerPixel[0] + width / 2;
      const y = pixel[1] - centerPixel[1] + height / 2;
      expect(x).toBeGreaterThanOrEqual(padding - 0.001);
      expect(x).toBeLessThanOrEqual(width - padding + 0.001);
      expect(y).toBeGreaterThanOrEqual(padding - 0.001);
      expect(y).toBeLessThanOrEqual(height - padding + 0.001);
    }
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
