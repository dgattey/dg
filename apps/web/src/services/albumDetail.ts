import 'server-only';

import { fetchAlbumDetail } from '@dg/services/spotify/fetchAlbumDetail';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const ALBUM_DETAIL_TAG = 'album-detail';

/**
 * Album detail for the favorite-albums well. Hours-long cache matches the
 * playlist albums page; missing Spotify tokens degrade to null so prerender
 * can still render an empty state.
 */
export async function getAlbumDetail(albumId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(ALBUM_DETAIL_TAG);
  cacheTag(`${ALBUM_DETAIL_TAG}-${albumId}`);
  return await withMissingTokenFallback(fetchAlbumDetail(albumId));
}
