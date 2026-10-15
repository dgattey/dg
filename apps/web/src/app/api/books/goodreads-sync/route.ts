import {
  DEFAULT_ENVIRONMENT_ID,
  MAX_SYNC_RAW_BODY_BYTES,
} from '@dg/content-models/books/bookDomain';
import {
  type GoodreadsSyncSummary,
  runGoodreadsSync,
} from '@dg/services/contentful/syncBooksToContentful';
import {
  SAGA_SIGNATURE_HEADER,
  SAGA_TIMESTAMP_HEADER,
  verifySagaRequestAuth,
} from '@dg/services/contentful/verifySagaRequestAuth';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

type GoodreadsSyncRouteResponse = {
  body: GoodreadsSyncSummary | { error: string; ok: false };
  status: number;
};

export async function handleGoodreadsSync(
  request: NextRequest,
): Promise<GoodreadsSyncRouteResponse> {
  let rawBody = '';
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      rawBody = await request.text();
    } catch {
      rawBody = '';
    }
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_SYNC_RAW_BODY_BYTES) {
      return {
        body: { error: 'Request body exceeds maximum allowed size', ok: false },
        status: 400,
      };
    }
  }

  const authResult = verifySagaRequestAuth({
    authorizationHeader: request.headers.get('authorization'),
    method: request.method,
    pathname: request.nextUrl.pathname,
    rawBody,
    signatureHeader: request.headers.get(SAGA_SIGNATURE_HEADER),
    timestampHeader: request.headers.get(SAGA_TIMESTAMP_HEADER),
  });

  if (!authResult.ok) {
    log.warn('Unauthorized Goodreads sync request', {
      hasAuthHeader: request.headers.has('authorization'),
      hasSignatureHeader: request.headers.has(SAGA_SIGNATURE_HEADER),
      reason: authResult.reason,
    });
    return { body: { error: 'Unauthorized', ok: false }, status: 401 };
  }

  const goodreadsUserId = (process.env.GOODREADS_USER_ID ?? '').trim();
  const goodreadsRssKey = (process.env.GOODREADS_RSS_KEY ?? '').trim();
  const contentfulSpaceId = (process.env.CONTENTFUL_SPACE_ID ?? '').trim();
  const contentfulEnvironmentId = (
    process.env.CONTENTFUL_ENVIRONMENT_ID ?? DEFAULT_ENVIRONMENT_ID
  ).trim();
  const contentfulManagementToken = (process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? '').trim();

  const missingVars = [
    !goodreadsUserId && 'GOODREADS_USER_ID',
    !contentfulSpaceId && 'CONTENTFUL_SPACE_ID',
    !contentfulManagementToken && 'CONTENTFUL_MANAGEMENT_ACCESS_TOKEN',
  ].filter((name): name is string => Boolean(name));

  if (missingVars.length > 0) {
    return {
      body: {
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        ok: false,
      },
      status: 500,
    };
  }

  try {
    const result = await runGoodreadsSync({
      contentfulEnvironmentId,
      contentfulManagementToken,
      contentfulSpaceId,
      goodreadsRssKey: goodreadsRssKey || null,
      goodreadsUserId,
    });

    if (result.createdCount > 0 || result.updatedCount > 0) {
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
      body: { error: message, ok: false },
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
