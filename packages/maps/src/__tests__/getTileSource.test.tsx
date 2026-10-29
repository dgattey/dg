import { renderToString } from 'react-dom/server';
import { RoutePeek } from '../../RoutePeek';
import { getTileSource, keyedStadiaTileUrl } from '../getTileSource';
import { RouteAtlasMap } from '../RouteAtlasMap';
import type { GeoBounds, MapRoute } from '../routeFrame';
import { encodePolyline } from '../routeGeometry';

const KEY = 'stadia-test-key';
const BOUNDS: GeoBounds = [
  [37.7, -122.5],
  [37.82, -122.38],
];
const ROUTES: ReadonlyArray<MapRoute> = [
  {
    id: 1,
    polyline: encodePolyline([
      [37.76, -122.45],
      [37.78, -122.41],
    ]),
    tone: 'cobalt',
  },
];
const socialTile = {
  extension: 'png',
  retina: true,
  style: 'alidade_smooth',
  x: 4,
  y: 5,
  zoom: 6,
} as const;

const withEnv = (env: NodeJS.ProcessEnv) => jest.replaceProperty(process, 'env', env);

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getTileSource with STADIA_API_KEY set in production', () => {
  beforeEach(() => {
    withEnv({ NODE_ENV: 'production', STADIA_API_KEY: KEY });
  });

  it('hands client maps a tile source with no key to serialize', () => {
    expect(JSON.stringify(getTileSource())).toBe('{"mode":"stadia"}');
  });

  it('renders Stadia tiles into server and client map HTML without the key', () => {
    const html = renderToString(
      <>
        <RoutePeek routes={ROUTES} />
        <RouteAtlasMap
          bounds={BOUNDS}
          label="Route atlas"
          routes={ROUTES}
          tileSource={getTileSource()}
        />
      </>,
    );

    expect(html).toContain('https://tiles.stadiamaps.com/tiles/outdoors/');
    expect(html).not.toContain(KEY);
  });

  it('adds the key to tiles the server fetches itself', () => {
    expect(keyedStadiaTileUrl(socialTile)).toBe(
      `https://tiles.stadiamaps.com/tiles/alidade_smooth/6/4/5@2x.png?api_key=${KEY}`,
    );
  });
});

describe('keyedStadiaTileUrl outside production', () => {
  it('fetches keyless, like the localhost dev server', () => {
    withEnv({ NODE_ENV: 'development', STADIA_API_KEY: KEY });

    expect(keyedStadiaTileUrl(socialTile)).toBe(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth/6/4/5@2x.png',
    );
  });
});
