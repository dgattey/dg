import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { getFavoriteAlbums } from '../../../../services/albums';
import { CACHE_TAGS } from '../../../../services/cacheTags';
import {
  getCachedLatestPlayedAt,
  shouldRefreshFavoriteAlbums,
} from '../../../../services/spotifySync';
import { isCronAuthorized } from '../../apiResponses';

type SyncResponse = {
  status: number;
  body: {
    error?: string;
    favoriteAlbums?: number;
    favoriteAlbumsRefreshed?: boolean;
    gapDetected?: boolean;
    inserted?: number;
    retryAfterSeconds?: number;
    success?: boolean;
    total?: number;
  };
};

export async function handleSpotifySync(request: NextRequest): Promise<SyncResponse> {
  if (!isCronAuthorized(request)) {
    log.warn('Unauthorized sync request', {
      hasAuthHeader: request.headers.has('authorization'),
    });
    return { body: { error: 'Unauthorized' }, status: 401 };
  }

  const forceFavoriteAlbums = request.nextUrl.searchParams.get('force') === 'true';
  const knownLatestPlayedAt = forceFavoriteAlbums ? null : await getCachedLatestPlayedAt();

  const result = await syncSpotifyHistoryWithLogging({
    context: 'cron',
    failureLogLevel: 'error',
    knownLatestPlayedAt,
  });

  const refreshAlbums =
    forceFavoriteAlbums ||
    (result.status === 'ok' && result.inserted > 0) ||
    (await shouldRefreshFavoriteAlbums());

  const favoriteAlbums = refreshAlbums
    ? await refreshFavoriteAlbumsSnapshotWithLogging({
        storedAlbums: await getFavoriteAlbums().catch(() => null),
      })
    : null;

  if (forceFavoriteAlbums || favoriteAlbums?.changed) {
    revalidateTag(CACHE_TAGS.favoriteAlbums, 'max');
    revalidateTag(CACHE_TAGS.musicStats, 'max');
  }

  if (result.status === 'failed') {
    return {
      body: {
        error: result.reason,
        favoriteAlbums: favoriteAlbums?.count,
        favoriteAlbumsRefreshed: favoriteAlbums !== null,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      status: 500,
    };
  }

  if (forceFavoriteAlbums || result.inserted > 0 || result.total > 0) {
    revalidateTag(CACHE_TAGS.musicHistory, 'max');
    revalidateTag(CACHE_TAGS.musicStats, 'max');
    revalidateTag(CACHE_TAGS.latestSong, 'max');
  }

  return {
    body: {
      favoriteAlbums: favoriteAlbums?.count,
      favoriteAlbumsRefreshed: favoriteAlbums !== null,
      gapDetected: result.gapDetected,
      inserted: result.inserted,
      success: true,
      total: result.total,
    },
    status: 200,
  };
}

export async function GET(request: NextRequest) {
  const response = await handleSpotifySync(request);
  return NextResponse.json(response.body, { status: response.status });
}
