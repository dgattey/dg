import { OFFLINE_TILES } from '../offlineTile';
import { resolveTileSource, stadiaTileUrl } from '../tileSource';

const watercolor = { extension: 'jpg', style: 'stamen_watercolor', x: 1, y: 2, zoom: 3 } as const;
const STADIA_API_KEY = 'secret-key';

describe('tile source', () => {
  it.each(['development', undefined])('sends no key when NODE_ENV is %s', (NODE_ENV) => {
    const source = resolveTileSource({ NODE_ENV, STADIA_API_KEY });

    expect(source).toEqual({ apiKey: null, mode: 'stadia' });
    expect(stadiaTileUrl(source, watercolor)).toBe(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/3/1/2.jpg',
    );
  });

  it('sends the key in production', () => {
    const source = resolveTileSource({ NODE_ENV: 'production', STADIA_API_KEY });

    expect(stadiaTileUrl(source, watercolor)).toBe(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/3/1/2.jpg?api_key=secret-key',
    );
  });

  it('omits the query string in production when no key is configured', () => {
    const source = resolveTileSource({ NODE_ENV: 'production' });

    expect(stadiaTileUrl(source, watercolor)).toBe(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/3/1/2.jpg',
    );
  });

  it('builds retina urls', () => {
    const source = resolveTileSource({ NODE_ENV: 'production', STADIA_API_KEY });

    expect(
      stadiaTileUrl(source, {
        extension: 'png',
        retina: true,
        style: 'outdoors',
        x: 4,
        y: 5,
        zoom: 6,
      }),
    ).toBe('https://tiles.stadiamaps.com/tiles/outdoors/6/4/5@2x.png?api_key=secret-key');
  });

  it.each([
    { MAP_TILES: 'offline', NODE_ENV: 'production' },
    { MAP_TILES: 'offline', NODE_ENV: 'development' },
    { NODE_ENV: 'test' },
  ])('serves the local placeholder for %o', (env) => {
    const source = resolveTileSource({ ...env, STADIA_API_KEY });

    expect(source).toEqual({ mode: 'offline' });
    expect(stadiaTileUrl(source, watercolor)).toBe(OFFLINE_TILES.light);
    expect(stadiaTileUrl(source, { ...watercolor, dark: true })).toBe(OFFLINE_TILES.dark);
  });

  it('keeps the placeholder inline so offline maps make no requests', () => {
    for (const tile of Object.values(OFFLINE_TILES)) {
      expect(tile).toMatch(/^data:image\/svg\+xml,/);
      expect(tile).not.toContain('stadiamaps');
    }
  });
});
