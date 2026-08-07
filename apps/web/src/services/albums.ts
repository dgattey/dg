import 'server-only';

import { readFavoriteAlbumsSnapshot } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { cacheLife, cacheTag } from 'next/cache';

const FAVORITE_ALBUMS_TAG = 'favorite-albums';

/**
 * Favorite albums are read only from the database snapshot. The half-hourly
 * Spotify sync owns refreshing it, so neither page renders nor builds ever
 * touch the rate-limited playlist endpoint.
 *
 * A regular cache is sufficient here because the database is already the
 * shared durable cache; a miss costs one fast query, not a Spotify call.
 */
export async function getFavoriteAlbums() {
  'use cache';
  cacheLife('hours');
  cacheTag(FAVORITE_ALBUMS_TAG);
  return await readFavoriteAlbumsSnapshot();
}
