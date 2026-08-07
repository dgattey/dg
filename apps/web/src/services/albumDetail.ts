import 'server-only';

import { fetchAlbumDetail } from '@dg/services/spotify/fetchAlbumDetail';
import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import { cacheLife, cacheTag } from 'next/cache';

const ALBUM_DETAIL_TAG = 'album-detail';

/**
 * Cached album-detail read. Isolated so Spotify failures do not poison the
 * hours-long cache with a null entry.
 */
async function getAlbumDetailCached(albumId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(ALBUM_DETAIL_TAG);
  cacheTag(`${ALBUM_DETAIL_TAG}-${albumId}`);
  return await fetchAlbumDetail(albumId);
}

/**
 * Album detail for the favorite-albums well. Hours-long cache matches the
 * playlist albums page. Missing tokens, rate limits, and other Spotify
 * failures degrade to undefined so the well can show a temporary unavailable
 * state; null remains reserved for a real Spotify 404.
 * Failures are not written into the successful-read cache.
 */
export async function getAlbumDetail(albumId: string) {
  try {
    return await getAlbumDetailCached(albumId);
  } catch (error) {
    if (isMissingTokenError(error)) {
      return undefined;
    }
    log.warn('Album detail unavailable; degrading to empty state', { albumId, error });
    return undefined;
  }
}
