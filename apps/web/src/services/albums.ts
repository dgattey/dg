import 'server-only';

import { readFavoriteAlbumsSnapshot } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { cacheLife, cacheTag } from 'next/cache';

const FAVORITE_ALBUMS_TAG = 'favorite-albums';

export async function getFavoriteAlbums() {
  'use cache: remote';
  cacheLife('days');
  cacheTag(FAVORITE_ALBUMS_TAG);
  return await readFavoriteAlbumsSnapshot();
}
