import 'server-only';

import { resolveTileSource, stadiaTileUrl, type TileRequest } from './tileSource';

/** The single place map code reads tile config from the environment. */
export const getTileSource = () => resolveTileSource(process.env);

/**
 * A Stadia tile URL for the server to fetch itself. Server requests carry no
 * page domain for Stadia to authorize, so production ones send `STADIA_API_KEY`.
 * Never render this URL or pass it to the client.
 */
export function keyedStadiaTileUrl(tile: TileRequest) {
  const url = new URL(stadiaTileUrl({ mode: 'stadia' }, tile));
  const { NODE_ENV, STADIA_API_KEY } = process.env;
  if (NODE_ENV === 'production' && STADIA_API_KEY) {
    url.searchParams.set('api_key', STADIA_API_KEY);
  }
  return url.toString();
}
