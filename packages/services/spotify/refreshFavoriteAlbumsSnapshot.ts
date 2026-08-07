import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import { writeFavoriteAlbumsSnapshot } from './favoriteAlbumsSnapshot';
import { fetchPlaylistAlbums } from './fetchPlaylistAlbums';

/** Playlist holding one or more tracks from each favorite album. */
const FAVORITE_ALBUMS_PLAYLIST_ID = '1bbwGrz6rSq5APjRfZp63U';

/**
 * Refreshes the favorite-albums snapshot from Spotify once.
 *
 * There is deliberately no retry here. If Spotify returns a rate limit, the
 * stored snapshot remains valid and the scheduled sync tries again in 30
 * minutes, after the supplied Retry-After has had time to elapse.
 */
export async function refreshFavoriteAlbumsSnapshot(): Promise<{ count: number }> {
  const albums = await fetchPlaylistAlbums(FAVORITE_ALBUMS_PLAYLIST_ID);
  await writeFavoriteAlbumsSnapshot(albums);
  log.info('Favorite albums snapshot refreshed', { count: albums.length });
  return { count: albums.length };
}

/** Runs a snapshot refresh without allowing it to fail the history sync. */
export async function refreshFavoriteAlbumsSnapshotWithLogging() {
  try {
    return await refreshFavoriteAlbumsSnapshot();
  } catch (error) {
    log.warn('Favorite albums snapshot refresh failed; keeping stored snapshot', {
      error: serializeError(error as Error),
    });
    return null;
  }
}
