import {
  DEFAULT_ENVIRONMENT_ID,
  type GoodreadsSyncSummary,
  runGoodreadsSync,
} from '@dg/services/contentful/booksServer';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

const isAuthorized = (request: NextRequest): boolean => {
  const expectedSecret = (
    process.env.CRON_SECRET ??
    process.env.GOODREADS_SYNC_SECRET ??
    ''
  ).trim();
  if (!expectedSecret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${expectedSecret}`;
};

type GoodreadsSyncRouteResponse = {
  body:
    | GoodreadsSyncSummary
    | {
        error: string;
        ok: false;
      };
  status: number;
};

async function parseDryRunFlag(request: NextRequest): Promise<boolean> {
  const searchParam =
    request.nextUrl.searchParams.get('dryRun') ?? request.nextUrl.searchParams.get('dry_run');
  if (searchParam === 'true' || searchParam === '1') {
    return true;
  }
  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { dryRun?: boolean | string } | null;
      return body?.dryRun === true || body?.dryRun === 'true' || body?.dryRun === '1';
    } catch {
      return false;
    }
  }
  return false;
}

export async function handleGoodreadsSync(
  request: NextRequest,
): Promise<GoodreadsSyncRouteResponse> {
  if (!isAuthorized(request)) {
    log.warn('Unauthorized Goodreads sync request', {
      hasAuthHeader: request.headers.has('authorization'),
    });
    return { body: { error: 'Unauthorized', ok: false }, status: 401 };
  }

  const goodreadsUserId = (process.env.GOODREADS_USER_ID ?? '').trim();
  const goodreadsRssKey = (process.env.GOODREADS_RSS_KEY ?? '').trim();
  const contentfulSpaceId = (process.env.CONTENTFUL_SPACE_ID ?? '').trim();
  const contentfulEnvironmentId = (
    process.env.CONTENTFUL_ENVIRONMENT_ID ?? DEFAULT_ENVIRONMENT_ID
  ).trim();
  const contentfulManagementToken = (
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ??
    process.env.CONTENTFUL_MANAGEMENT_TOKEN ??
    ''
  ).trim();

  const missingVars: Array<string> = [];
  if (!goodreadsUserId) {
    missingVars.push('GOODREADS_USER_ID');
  }
  if (!contentfulSpaceId) {
    missingVars.push('CONTENTFUL_SPACE_ID');
  }
  if (!contentfulManagementToken) {
    missingVars.push('CONTENTFUL_MANAGEMENT_ACCESS_TOKEN');
  }

  if (missingVars.length > 0) {
    return {
      body: {
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        ok: false,
      },
      status: 500,
    };
  }

  const dryRun = await parseDryRunFlag(request);

  try {
    const result = await runGoodreadsSync({
      contentfulEnvironmentId,
      contentfulManagementToken,
      contentfulSpaceId,
      dryRun,
      goodreadsRssKey: goodreadsRssKey || null,
      goodreadsUserId,
    });

    if (!dryRun && (result.createdCount > 0 || result.updatedCount > 0)) {
      revalidateTag('contentful', 'max');
    }

    return {
      body: result,
      status: result.ok ? 200 : 207,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('Goodreads sync failed', { error: message });
    return {
      body: {
        error: message,
        ok: false,
      },
      status: 500,
    };
  }
}

export async function GET(request: NextRequest) {
  const response = await handleGoodreadsSync(request);
  return NextResponse.json(response.body, { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await handleGoodreadsSync(request);
  return NextResponse.json(response.body, { status: response.status });
}
