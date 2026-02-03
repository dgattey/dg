import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { log } from '@dg/shared-core/helpers/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

const isAuthorized = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${CRON_SECRET}`;
};

type CronResponse = {
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

export async function handleSpotifyHistoryCron(request: NextRequest): Promise<CronResponse> {
  if (!isAuthorized(request)) {
    log.warn('Unauthorized cron request', {
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
  const response = await handleSpotifyHistoryCron(request);
  return NextResponse.json(response.body, { status: response.status });
}
