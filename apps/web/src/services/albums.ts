import 'server-only';

import { fetchPlaylistAlbums } from '@dg/services/spotify/fetchPlaylistAlbums';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const FAVORITE_ALBUMS_TAG = 'favorite-albums';

/** Playlist holding one or more tracks from each favorite album. */
const FAVORITE_ALBUMS_PLAYLIST_ID = '1bbwGrz6rSq5APjRfZp63U';

/**
 * Favorite albums from the curated playlist, deduped and newest-added first,
 * or null when the Spotify token is missing (e.g. preview builds whose
 * database has no token row) so prerendering degrades instead of failing.
 * The playlist changes rarely so hours-long caching is fine. Do not schedule
 * `after()` work here: this 'use cache' scope re-executes during ISR
 * revalidation and PPR resume where `waitUntil` can be unavailable, and the
 * resulting throw kills the whole RSC stream.
 */
export async function getFavoriteAlbums() {
  'use cache';
  cacheLife('hours');
  cacheTag(FAVORITE_ALBUMS_TAG);
  return await withMissingTokenFallback(fetchPlaylistAlbums(FAVORITE_ALBUMS_PLAYLIST_ID));
}
