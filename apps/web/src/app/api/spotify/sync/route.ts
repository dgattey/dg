import { timingSafeEqual } from 'node:crypto';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { getFavoriteAlbums } from '../../../../services/albums';
import {
  getCachedLatestPlayedAt,
  shouldRefreshFavoriteAlbums,
} from '../../../../services/spotifySync';

const BEARER_PREFIX = 'Bearer ';

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get('authorization');
  if (!secret || !authHeader?.startsWith(BEARER_PREFIX)) {
    return false;
  }
  const provided = authHeader.slice(BEARER_PREFIX.length);
  const providedBuffer = Buffer.from(provided, 'utf8');
  const expectedBuffer = Buffer.from(secret, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

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
  if (!isAuthorized(request)) {
    log.warn('Unauthorized sync request', {
      hasAuthHeader: request.headers.has('authorization'),
    });
    return { body: { error: 'Unauthorized' }, status: 401 };
  }

  const forceFavoriteAlbums = request.nextUrl.searchParams.get('force') === 'true';
  const knownLatestPlayedAt = await getCachedLatestPlayedAt();

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
        storedAlbums: await getFavoriteAlbums(),
      })
    : null;

  if (favoriteAlbums?.changed) {
    revalidateTag('favorite-albums', 'max');
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

  if (result.inserted > 0 || result.total > 0) {
    revalidateTag('music-history', 'max');
    revalidateTag('latest-song', 'max');
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
