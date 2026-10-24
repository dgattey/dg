import {
  DEFAULT_ENVIRONMENT_ID,
  MAX_SYNC_RAW_BODY_BYTES,
} from '@dg/content-models/books/bookDomain';
import { validateBooksSyncPayload } from '@dg/content-models/books/bookSchema';
import { ContentfulCmaClient } from '@dg/services/contentful/contentfulCmaClient';
import {
  type BookMutationOutcome,
  upsertBookToContentful,
} from '@dg/services/contentful/syncBooksToContentful';
import {
  SAGA_SIGNATURE_HEADER,
  SAGA_TIMESTAMP_HEADER,
  verifySagaRequestAuth,
} from '@dg/services/contentful/verifySagaRequestAuth';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '../../../../services/cacheTags';

type BooksSyncRouteResponse = {
  body:
    | {
        deleted: number;
        entries: Array<BookMutationOutcome>;
        error?: string;
        errors: Array<{ id?: string; message: string; title?: string }>;
        ok: boolean;
        revalidated: boolean;
        upserted: number;
      }
    | {
        error: string;
        ok: false;
      };
  status: number;
};

function createCmaClient(): ContentfulCmaClient | { error: string } {
  const contentfulSpaceId = (process.env.CONTENTFUL_SPACE_ID ?? '').trim();
  const contentfulEnvironmentId = (
    process.env.CONTENTFUL_ENVIRONMENT_ID ?? DEFAULT_ENVIRONMENT_ID
  ).trim();
  const contentfulManagementToken = (process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? '').trim();

  const missing = [
    !contentfulSpaceId && 'CONTENTFUL_SPACE_ID',
    !contentfulManagementToken && 'CONTENTFUL_MANAGEMENT_ACCESS_TOKEN',
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    return { error: `Missing required environment variables: ${missing.join(', ')}` };
  }

  return new ContentfulCmaClient({
    environmentId: contentfulEnvironmentId,
    managementToken: contentfulManagementToken,
    spaceId: contentfulSpaceId,
  });
}

export async function handleBooksSync(request: NextRequest): Promise<BooksSyncRouteResponse> {
  let rawBody = '';
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

  const authResult = verifySagaRequestAuth({
    authorizationHeader: request.headers.get('authorization'),
    method: request.method,
    pathname: request.nextUrl.pathname,
    rawBody,
    signatureHeader: request.headers.get(SAGA_SIGNATURE_HEADER),
    timestampHeader: request.headers.get(SAGA_TIMESTAMP_HEADER),
  });

  if (!authResult.ok) {
    log.warn('Unauthorized books sync request', {
      hasAuthHeader: request.headers.has('authorization'),
      hasSignatureHeader: request.headers.has(SAGA_SIGNATURE_HEADER),
      reason: authResult.reason,
    });
    return { body: { error: 'Unauthorized', ok: false }, status: 401 };
  }

  const cmaOrError = createCmaClient();
  if ('error' in cmaOrError) {
    return { body: { error: cmaOrError.error, ok: false }, status: 500 };
  }

  let parsedPayload: unknown = null;
  try {
    parsedPayload = JSON.parse(rawBody);
  } catch {
    return { body: { error: 'Invalid JSON request body', ok: false }, status: 400 };
  }

  const validatedPayload = validateBooksSyncPayload(parsedPayload);
  if (!validatedPayload.ok) {
    return {
      body: { error: validatedPayload.error, ok: false },
      status: 400,
    };
  }

  const { booksToUpsert, deletedIdsToProcess } = validatedPayload.data;

  const entries: Array<BookMutationOutcome> = [];
  let deleted = 0;
  const errors: Array<{ id?: string; message: string; title?: string }> = [];

  for (const id of deletedIdsToProcess) {
    try {
      if (await cmaOrError.unpublishAndDeleteBook(id)) {
        deleted += 1;
      }
    } catch (error) {
      errors.push({
        id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const bookInput of booksToUpsert) {
    try {
      entries.push(await upsertBookToContentful(cmaOrError, bookInput));
    } catch (error) {
      errors.push({
        id: bookInput.id ?? undefined,
        message: error instanceof Error ? error.message : String(error),
        title: bookInput.title,
      });
    }
  }

  const revalidated = entries.length > 0 || deleted > 0;
  if (revalidated) {
    revalidateTag(CACHE_TAGS.contentful, 'max');
  }

  const ok = errors.length === 0;
  return {
    body: {
      deleted,
      entries,
      ...(errors[0] ? { error: errors[0].message } : {}),
      errors,
      ok,
      revalidated,
      upserted: entries.length,
    },
    status: ok ? 200 : 207,
  };
}

export async function POST(request: NextRequest) {
  const response = await handleBooksSync(request);
  return NextResponse.json(response.body, { status: response.status });
}
