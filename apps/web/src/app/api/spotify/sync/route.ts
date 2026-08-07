import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

const isAuthorized = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
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

  const result = await syncSpotifyHistoryWithLogging({
    context: 'cron',
    failureLogLevel: 'error',
  });
  const favoriteAlbums = await refreshFavoriteAlbumsSnapshotWithLogging();

  if (favoriteAlbums) {
    revalidateTag('favorite-albums', 'max');
  }

  // A run that could not read Spotify must not answer 2xx. The scheduled
  // workflow uses `curl -f`, so a success status is the only thing standing
  // between a broken sync and a green check.
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

  if (result.inserted > 0) {
    revalidateTag('music-history', 'max');
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
