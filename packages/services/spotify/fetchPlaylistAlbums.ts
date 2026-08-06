import 'server-only';

import {
  mapPlaylistAlbumsFromApi,
  type PlaylistAlbum,
  playlistItemsPageApiSchema,
} from '@dg/content-models/spotify/PlaylistAlbums';
import { log } from '@dg/shared-core/logging/log';
import { spotifyGetWithRetry } from './trackMetadataShared';

const PAGE_SIZE = 50;

/**
 * Hard stop so a runaway playlist can't page forever (5000 tracks). Whole
 * albums get added to the playlist, so track count runs ~15x album count.
 */
const MAX_PAGES = 100;

/**
 * Fetches every item of a playlist and collapses them into unique albums,
 * newest playlist addition first. Throws on non-200 so callers never cache
 * a silently empty list. Rate limits are retried (Retry-After aware) inside
 * spotifyGetWithRetry before this throws.
 */
export async function fetchPlaylistAlbums(playlistId: string): Promise<Array<PlaylistAlbum>> {
  const items: Array<unknown> = [];
  let hasMore = true;
  for (let page = 0; hasMore && page < MAX_PAGES; page += 1) {
    const resource = `playlists/${playlistId}/tracks?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`;
    const result = await spotifyGetWithRetry(resource, playlistItemsPageApiSchema, 'playlist page');
    if (!result.success) {
      throw new Error(`Spotify playlist ${playlistId} fetch failed with status ${result.status}`);
    }
    items.push(...result.data.items);
    hasMore = Boolean(result.data.next);
  }
  if (hasMore) {
    log.warn('Playlist truncated at page cap; newest additions may be missing', {
      maxPages: MAX_PAGES,
      playlistId,
    });
  }
  return mapPlaylistAlbumsFromApi(items);
}
