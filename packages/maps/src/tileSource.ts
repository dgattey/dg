const STADIA_ORIGIN = 'https://tiles.stadiamaps.com';

/** Offline tiles come from this site's own `/tiles` route, which mirrors Stadia's paths. */
const TILE_ORIGINS = { offline: '', stadia: STADIA_ORIGIN } as const;

/**
 * Reaches the browser as a prop, so it never carries the API key. Stadia
 * authorizes browser tile requests by the page's domain, and localhost needs no key.
 */
export type TileSource = { mode: keyof typeof TILE_ORIGINS };

type TileEnv = {
  MAP_TILES?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
};

/**
 * Stadia's domain auth covers the production domain only, so Vercel previews
 * use offline tiles like tests and `MAP_TILES=offline` do.
 */
export function resolveTileSource({ MAP_TILES, NODE_ENV, VERCEL_ENV }: TileEnv): TileSource {
  const offline = MAP_TILES === 'offline' || NODE_ENV === 'test' || VERCEL_ENV === 'preview';
  return { mode: offline ? 'offline' : 'stadia' };
}

export type TileRequest = {
  extension: 'jpg' | 'png';
  retina?: boolean;
  style: string;
  x: number;
  y: number;
  zoom: number;
};

export function stadiaTileUrl(
  source: TileSource,
  { extension, retina = false, style, x, y, zoom }: TileRequest,
) {
  const density = retina ? '@2x' : '';
  return `${TILE_ORIGINS[source.mode]}/tiles/${style}/${zoom}/${x}/${y}${density}.${extension}`;
}

/**
 * Outdoors carries trails, contours, and greenery so it still reads as a map
 * under a scrim; Alidade Smooth Dark is its dark counterpart.
 */
export function outdoorsTileUrl(
  source: TileSource,
  {
    dark,
    dpr,
    x,
    y,
    zoom,
  }: {
    dark: boolean;
    dpr?: number;
    x: number;
    y: number;
    zoom: number;
  },
) {
  return stadiaTileUrl(source, {
    extension: 'png',
    retina: Boolean(dpr && dpr > 1),
    style: dark ? 'alidade_smooth_dark' : 'outdoors',
    x,
    y,
    zoom,
  });
}
