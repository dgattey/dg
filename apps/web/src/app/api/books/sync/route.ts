import {
  type BookMutationInput,
  type BookMutationOutcome,
  ContentfulCmaClient,
  DEFAULT_ENVIRONMENT_ID,
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

type BookMutationRequestBody = {
  action?: 'delete' | 'upsert';
  book?: BookMutationInput;
  books?: Array<BookMutationInput>;
  deletedIds?: Array<string>;
  id?: string;
} & Partial<BookMutationInput>;

export type BooksSyncRouteResponse = {
  body:
    | {
        deletedCount: number;
        deletedIds: Array<string>;
        errors: Array<{ id?: string; message: string; title?: string }>;
        ok: boolean;
        results: Array<BookMutationOutcome>;
        upsertedCount: number;
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
  const contentfulManagementToken = (
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ??
    process.env.CONTENTFUL_MANAGEMENT_TOKEN ??
    ''
  ).trim();

  const missing: Array<string> = [];
  if (!contentfulSpaceId) {
    missing.push('CONTENTFUL_SPACE_ID');
  }
  if (!contentfulManagementToken) {
    missing.push('CONTENTFUL_MANAGEMENT_ACCESS_TOKEN');
  }
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
  if (!isAuthorized(request)) {
    log.warn('Unauthorized books sync request', {
      hasAuthHeader: request.headers.has('authorization'),
    });
    return { body: { error: 'Unauthorized', ok: false }, status: 401 };
  }

  const cmaOrError = createCmaClient();
  if ('error' in cmaOrError) {
    return { body: { error: cmaOrError.error, ok: false }, status: 500 };
  }

  let payload: BookMutationRequestBody | null = null;
  try {
    payload = (await request.json()) as BookMutationRequestBody;
  } catch {
    const queryId = request.nextUrl.searchParams.get('id');
    if (request.method === 'DELETE' && queryId) {
      payload = { action: 'delete', deletedIds: [queryId] };
    } else {
      return { body: { error: 'Invalid JSON request body', ok: false }, status: 400 };
    }
  }

  const deletedIdsToProcess: Array<string> = [];
  if (Array.isArray(payload?.deletedIds)) {
    for (const id of payload.deletedIds) {
      if (typeof id === 'string' && id.trim()) {
        deletedIdsToProcess.push(id.trim());
      }
    }
  }
  if (
    (request.method === 'DELETE' || payload?.action === 'delete') &&
    typeof payload?.id === 'string' &&
    payload.id.trim()
  ) {
    deletedIdsToProcess.push(payload.id.trim());
  }

  const booksToUpsert: Array<BookMutationInput> = [];
  if (Array.isArray(payload?.books)) {
    booksToUpsert.push(...payload.books);
  } else if (payload?.book) {
    booksToUpsert.push(payload.book);
  } else if (
    request.method !== 'DELETE' &&
    payload?.action !== 'delete' &&
    typeof payload?.title === 'string' &&
    payload.title.trim()
  ) {
    booksToUpsert.push(payload as BookMutationInput);
  }

  if (deletedIdsToProcess.length === 0 && booksToUpsert.length === 0) {
    return {
      body: {
        error: 'Request must include at least one book to upsert or id to delete',
        ok: false,
      },
      status: 400,
    };
  }

  const results: Array<BookMutationOutcome> = [];
  const deletedIds: Array<string> = [];
  const errors: Array<{ id?: string; message: string; title?: string }> = [];

  for (const id of deletedIdsToProcess) {
    try {
      const deleted = await cmaOrError.unpublishAndDeleteBook(id);
      if (deleted) {
        deletedIds.push(id);
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
      const outcome = await cmaOrError.upsertBook(bookInput);
      results.push(outcome);
    } catch (error) {
      errors.push({
        id: bookInput.id ?? undefined,
        message: error instanceof Error ? error.message : String(error),
        title: bookInput.title,
      });
    }
  }

  if (results.length > 0 || deletedIds.length > 0) {
    revalidateTag('contentful', 'max');
  }

  const ok = errors.length === 0;
  return {
    body: {
      deletedCount: deletedIds.length,
      deletedIds,
      errors,
      ok,
      results,
      upsertedCount: results.length,
    },
    status: ok ? 200 : 207,
  };
}

export async function POST(request: NextRequest) {
  const response = await handleBooksSync(request);
  return NextResponse.json(response.body, { status: response.status });
}

export async function PUT(request: NextRequest) {
  const response = await handleBooksSync(request);
  return NextResponse.json(response.body, { status: response.status });
}

export async function PATCH(request: NextRequest) {
  const response = await handleBooksSync(request);
  return NextResponse.json(response.body, { status: response.status });
}

export async function DELETE(request: NextRequest) {
  const response = await handleBooksSync(request);
  return NextResponse.json(response.body, { status: response.status });
}
