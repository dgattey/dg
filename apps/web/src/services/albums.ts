import 'server-only';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { fetchPlaylistAlbums } from '@dg/services/spotify/fetchPlaylistAlbums';
import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';

const FAVORITE_ALBUMS_TAG = 'favorite-albums';

/** Playlist holding one or more tracks from each favorite album. */
const FAVORITE_ALBUMS_PLAYLIST_ID = '1bbwGrz6rSq5APjRfZp63U';

/**
 * Cached playlist read, returning a result rather than throwing so that an
 * unavailable Spotify is cached too.
 *
 * Two properties here are load-bearing rather than optimizations:
 *
 * `remote`, because this runs outside the static shell (see
 * `getFavoriteAlbums`) and a plain `use cache` is in-memory per instance.
 * Serverless instances each missed and re-fetched, turning one rate-limited
 * endpoint into a per-visitor Spotify call — the documented case for a remote
 * handler.
 *
 * Caching the failure, because Spotify answers a blown quota with a
 * `Retry-After` measured in hours. Letting the failure escape uncached meant
 * every single request tried again, which is how the quota got blown in the
 * first place. Now Spotify sees roughly one attempt per revalidation window,
 * and recovery still happens on its own once the quota resets.
 */
async function getFavoriteAlbumsCached(): Promise<
  { albums: Array<PlaylistAlbum> } | { albums: null }
> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(FAVORITE_ALBUMS_TAG);
  try {
    return { albums: await fetchPlaylistAlbums(FAVORITE_ALBUMS_PLAYLIST_ID) };
  } catch (error) {
    if (!isMissingTokenError(error)) {
      log.warn('Favorite albums unavailable; degrading to empty state', { error });
    }
    return { albums: null };
  }
}

/**
 * Favorite albums from the curated playlist, deduped and newest-added first,
 * or null when Spotify is unavailable and nothing has ever been stored, so
 * prerendering degrades instead of failing the build.
 *
 * Do not schedule `after()` work here: this path can re-execute during ISR
 * revalidation and PPR resume where `waitUntil` can be unavailable, and the
 * resulting throw kills the whole RSC stream.
 */
export async function getFavoriteAlbums() {
  // Keep the live refresh out of prerendering so a rate limit can't fail the
  // build; callers already place this behind Suspense. `fetchPlaylistAlbums`
  // falls back to the stored snapshot, so a rate limit costs a stale list
  // rather than an empty page.
  await connection();
  const { albums } = await getFavoriteAlbumsCached();
  return albums;
}
