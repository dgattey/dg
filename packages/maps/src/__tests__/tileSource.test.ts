import { resolveTileSource, stadiaTileUrl } from '../tileSource';

const watercolor = { extension: 'jpg', style: 'stamen_watercolor', x: 1, y: 2, zoom: 3 } as const;
const retinaOutdoors = {
  extension: 'png',
  retina: true,
  style: 'outdoors',
  x: 4,
  y: 5,
  zoom: 6,
} as const;

describe('tile source', () => {
  it.each([
    { NODE_ENV: 'production', VERCEL_ENV: 'production' },
    { NODE_ENV: 'production' },
    { NODE_ENV: 'development' },
    {},
  ])('loads keyless Stadia tiles for %o', (env) => {
    const processEnv = { ...env, STADIA_API_KEY: 'secret-key' };
    const source = resolveTileSource(processEnv);

    expect(source).toEqual({ mode: 'stadia' });
    expect(stadiaTileUrl(source, watercolor)).toBe(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/3/1/2.jpg',
    );
    expect(stadiaTileUrl(source, retinaOutdoors)).toBe(
      'https://tiles.stadiamaps.com/tiles/outdoors/6/4/5@2x.png',
    );
  });

  it.each([
    { MAP_TILES: 'offline', NODE_ENV: 'production' },
    { MAP_TILES: 'offline', NODE_ENV: 'development' },
    { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
    { NODE_ENV: 'test' },
  ])('serves Stadia paths from this site for %o', (env) => {
    const source = resolveTileSource(env);

    expect(source).toEqual({ mode: 'offline' });
    expect(stadiaTileUrl(source, watercolor)).toBe('/tiles/stamen_watercolor/3/1/2.jpg');
    expect(stadiaTileUrl(source, retinaOutdoors)).toBe('/tiles/outdoors/6/4/5@2x.png');
  });
});
