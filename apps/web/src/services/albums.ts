import 'server-only';

import { fetchPlaylistAlbums } from '@dg/services/spotify/fetchPlaylistAlbums';
import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';

const FAVORITE_ALBUMS_TAG = 'favorite-albums';

/** Playlist holding one or more tracks from each favorite album. */
const FAVORITE_ALBUMS_PLAYLIST_ID = '1bbwGrz6rSq5APjRfZp63U';

/**
 * Cached playlist read. Lives in its own scope so a thrown Spotify failure
 * does not write an empty entry into the hours-long cache — the outer
 * wrapper catches and degrades instead.
 */
async function getFavoriteAlbumsCached() {
  'use cache';
  cacheLife('hours');
  cacheTag(FAVORITE_ALBUMS_TAG);
  return await fetchPlaylistAlbums(FAVORITE_ALBUMS_PLAYLIST_ID);
}

/**
 * Favorite albums from the curated playlist, deduped and newest-added first,
 * or null when Spotify is unavailable (missing token, rate limit, or other
 * fetch failure) so prerendering degrades instead of failing the build.
 * Successful reads stay hours-cached; failures are not cached.
 *
 * Do not schedule `after()` work here: this path can re-execute during ISR
 * revalidation and PPR resume where `waitUntil` can be unavailable, and the
 * resulting throw kills the whole RSC stream.
 */
export async function getFavoriteAlbums() {
  // This playlist has no faithful DB representation (membership and addedAt
  // live only at Spotify). Keep the live refresh out of prerendering; callers
  // already place it behind Suspense, and successful runtime reads stay cached.
  await connection();
  try {
    return await getFavoriteAlbumsCached();
  } catch (error) {
    if (isMissingTokenError(error)) {
      return null;
    }
    log.warn('Favorite albums unavailable; degrading to empty state', { error });
    return null;
  }
}
