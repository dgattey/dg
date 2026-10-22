import { OFFLINE_TILES } from './offlineTile';

const STADIA_ORIGIN = 'https://tiles.stadiamaps.com';

/** Where map tiles come from. Serializable so server wrappers can pass it to client maps. */
export type TileSource = { mode: 'offline' } | { apiKey: string | null; mode: 'stadia' };

type TileEnv = {
  MAP_TILES?: string;
  NODE_ENV?: string;
  STADIA_API_KEY?: string;
};

/**
 * Stadia serves keyless requests from localhost without drawing on the account's
 * monthly credits, so the key only goes out in production. Tests and
 * `MAP_TILES=offline` skip Stadia entirely.
 */
export function resolveTileSource({ MAP_TILES, NODE_ENV, STADIA_API_KEY }: TileEnv): TileSource {
  if (MAP_TILES === 'offline' || NODE_ENV === 'test') {
    return { mode: 'offline' };
  }
  return {
    apiKey: NODE_ENV === 'production' && STADIA_API_KEY ? STADIA_API_KEY : null,
    mode: 'stadia',
  };
}

type TileRequest = {
  dark?: boolean;
  extension: 'jpg' | 'png';
  retina?: boolean;
  style: string;
  x: number;
  y: number;
  zoom: number;
};

/** Adds the API key, when there is one, to any request bound for Stadia. */
export function withStadiaKey(source: TileSource, url: string) {
  if (source.mode !== 'stadia' || !source.apiKey || !url.startsWith(STADIA_ORIGIN)) {
    return url;
  }
  const keyed = new URL(url);
  keyed.searchParams.set('api_key', source.apiKey);
  return keyed.toString();
}

/** The vector style the interactive map draws, matching the card maps' raster styles. */
export const stadiaStyleUrl = (dark: boolean) =>
  `${STADIA_ORIGIN}/styles/${dark ? 'alidade_smooth_dark' : 'outdoors'}.json`;

export function stadiaTileUrl(
  source: TileSource,
  { dark = false, extension, retina = false, style, x, y, zoom }: TileRequest,
) {
  if (source.mode === 'offline') {
    return dark ? OFFLINE_TILES.dark : OFFLINE_TILES.light;
  }
  const density = retina ? '@2x' : '';
  return withStadiaKey(
    source,
    `${STADIA_ORIGIN}/tiles/${style}/${zoom}/${x}/${y}${density}.${extension}`,
  );
}
