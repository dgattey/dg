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
    gapDetected?: boolean;
    inserted?: number;
    skipped?: boolean;
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

  if (!result) {
    return { body: { error: 'Sync failed' }, status: 500 };
  }

  if (result.inserted > 0) {
    revalidateTag('spotify-history', 'max');
  }

  return {
    body: {
      gapDetected: result.gapDetected,
      inserted: result.inserted,
      skipped: result.skipped,
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
