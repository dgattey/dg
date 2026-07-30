import 'server-only';

import {
  mapPlaylistAlbumsFromApi,
  type PlaylistAlbum,
  playlistItemsPageApiSchema,
} from '@dg/content-models/spotify/PlaylistAlbums';
import { parseResponse } from '../clients/parseResponse';
import { getSpotifyClient } from './spotifyClient';

const PAGE_SIZE = 50;

/** Hard stop so a runaway playlist can't page forever (1000 tracks). */
const MAX_PAGES = 20;

/**
 * Fetches every item of a playlist and collapses them into unique albums,
 * newest playlist addition first. Throws on non-200 so callers never cache
 * a silently empty list.
 */
export async function fetchPlaylistAlbums(playlistId: string): Promise<Array<PlaylistAlbum>> {
  const items: Array<unknown> = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const resource = `playlists/${playlistId}/tracks?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`;
    const { response, status } = await getSpotifyClient().get(resource);
    if (status !== 200) {
      throw new Error(`Spotify playlist ${playlistId} fetch failed with status ${status}`);
    }
    const data = parseResponse(playlistItemsPageApiSchema, await response.json(), {
      kind: 'rest',
      source: 'spotify.fetchPlaylistAlbums',
    });
    items.push(...data.items);
    if (!data.next) {
      break;
    }
  }
  return mapPlaylistAlbumsFromApi(items);
}
