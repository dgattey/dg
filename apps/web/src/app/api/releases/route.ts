import { GITHUB_REPOSITORY_URL, upsertRelease } from '@dg/services/github/fetchReleases';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '../../../services/cacheTags';
import { isCronAuthorized } from '../apiResponses';

type ReleasePayload = {
  body?: unknown;
  publishedAt?: unknown;
  url?: unknown;
  version?: unknown;
};

type ReleaseSyncResponse = {
  body: {
    error?: string;
    ok: boolean;
    version?: string;
  };
  status: number;
};

export async function handleReleaseSync(request: NextRequest): Promise<ReleaseSyncResponse> {
  if (!isCronAuthorized(request)) {
    log.warn('Unauthorized release sync request', {
      hasAuthHeader: request.headers.has('authorization'),
    });
    return { body: { error: 'Unauthorized', ok: false }, status: 401 };
  }

  let payload: ReleasePayload;
  try {
    payload = (await request.json()) as ReleasePayload;
  } catch {
    return { body: { error: 'Invalid JSON body', ok: false }, status: 400 };
  }

  const version = typeof payload.version === 'string' ? payload.version.trim() : '';
  if (!version) {
    return { body: { error: 'Missing required field: version', ok: false }, status: 400 };
  }

  const tag = version.startsWith('v') ? version : `v${version}`;
  const url =
    typeof payload.url === 'string' && payload.url.trim()
      ? payload.url.trim()
      : `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`;
  const body = typeof payload.body === 'string' ? payload.body : '';
  const publishedAt =
    typeof payload.publishedAt === 'string' && payload.publishedAt.trim()
      ? payload.publishedAt.trim()
      : new Date().toISOString();

  const saved = await upsertRelease({
    body,
    publishedAt,
    url,
    version: tag,
  });

  if (!saved) {
    return { body: { error: `Invalid semver version: ${version}`, ok: false }, status: 400 };
  }

  revalidateTag(CACHE_TAGS.changelog, 'max');
  return {
    body: { ok: true, version: saved.tag },
    status: 200,
  };
}

export async function POST(request: NextRequest) {
  const response = await handleReleaseSync(request);
  return NextResponse.json(response.body, { status: response.status });
}
