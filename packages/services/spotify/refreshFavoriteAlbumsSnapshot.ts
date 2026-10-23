import 'server-only';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { log } from '@dg/shared-core/logging/log';
import { serializeError } from '@dg/shared-core/logging/maskSecrets';
import { writeFavoriteAlbumsSnapshot } from './favoriteAlbumsSnapshot';
import { fetchPlaylistAlbums } from './fetchPlaylistAlbums';

const FAVORITE_ALBUMS_PLAYLIST_ID = '1bbwGrz6rSq5APjRfZp63U';

type RefreshFavoriteAlbumsOptions = {
  storedAlbums?: Array<PlaylistAlbum> | null;
};

export async function refreshFavoriteAlbumsSnapshot(
  options?: RefreshFavoriteAlbumsOptions,
): Promise<{
  changed: boolean;
  count: number;
}> {
  const albums = await fetchPlaylistAlbums(FAVORITE_ALBUMS_PLAYLIST_ID);
  const changed = await writeFavoriteAlbumsSnapshot(albums, options?.storedAlbums);
  log.info('Favorite albums snapshot refreshed', { changed, count: albums.length });
  return { changed, count: albums.length };
}

export async function refreshFavoriteAlbumsSnapshotWithLogging(
  options?: RefreshFavoriteAlbumsOptions,
) {
  try {
    return await refreshFavoriteAlbumsSnapshot(options);
  } catch (error) {
    log.warn('Favorite albums snapshot refresh failed; keeping stored snapshot', {
      error: serializeError(error as Error),
    });
    return null;
  }
}
