import { NextRequest } from 'next/server';

jest.mock('@dg/services/contentful/syncBooksToContentful', () => ({
  runGoodreadsSync: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { runGoodreadsSync } from '@dg/services/contentful/syncBooksToContentful';
import {
  computeSagaHmacSignature,
  SAGA_SIGNATURE_HEADER,
  SAGA_TIMESTAMP_HEADER,
} from '@dg/services/contentful/verifySagaRequestAuth';
import { revalidateTag } from 'next/cache';
import { handleGoodreadsSync } from '../route';

const mockRunGoodreadsSync = jest.mocked(runGoodreadsSync);
const mockRevalidateTag = jest.mocked(revalidateTag);

describe('Goodreads sync API route', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.SAGA_API_SECRET = 'test-saga-hmac-secret';
    process.env.GOODREADS_USER_ID = '987654';
    process.env.GOODREADS_RSS_KEY = 'rss-key';
    process.env.CONTENTFUL_SPACE_ID = 'space-id';
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = 'cma-token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects requests without valid HMAC headers or Bearer token', async () => {
    const req = new NextRequest('http://localhost/api/books/goodreads-sync', { method: 'POST' });
    const res = await handleGoodreadsSync(req);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized', ok: false });
    expect(mockRunGoodreadsSync).not.toHaveBeenCalled();
  });

  it('authenticates HMAC-SHA256 signed requests from Saga and rejects expired timestamps', async () => {
    mockRunGoodreadsSync.mockResolvedValue({
      created: 0,
      createdCount: 0,
      durationMs: 25,
      errors: [],
      goodreadsItemsFetched: 1,
      ok: true,
      revalidated: false,
      scanned: 1,
      skippedCount: 1,
      unchanged: 1,
      updated: 0,
      updatedCount: 0,
    });

    const freshTimestamp = String(Math.floor(Date.now() / 1000));
    const validSignature = computeSagaHmacSignature({
      method: 'POST',
      pathname: '/api/books/goodreads-sync',
      rawBody: '',
      secret: 'test-saga-hmac-secret',
      timestamp: freshTimestamp,
    });

    const validReq = new NextRequest('http://localhost/api/books/goodreads-sync', {
      headers: {
        authorization: 'Bearer test-saga-hmac-secret',
        [SAGA_SIGNATURE_HEADER]: validSignature,
        [SAGA_TIMESTAMP_HEADER]: freshTimestamp,
      },
      method: 'POST',
    });

    const validRes = await handleGoodreadsSync(validReq);
    expect(validRes.status).toBe(200);
    expect(mockRevalidateTag).not.toHaveBeenCalled();

    const staleTimestamp = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
    const staleSignature = computeSagaHmacSignature({
      method: 'POST',
      pathname: '/api/books/goodreads-sync',
      rawBody: '',
      secret: 'test-saga-hmac-secret',
      timestamp: staleTimestamp,
    });

    const expiredReq = new NextRequest('http://localhost/api/books/goodreads-sync', {
      headers: {
        [SAGA_SIGNATURE_HEADER]: staleSignature,
        [SAGA_TIMESTAMP_HEADER]: staleTimestamp,
      },
      method: 'POST',
    });

    const expiredRes = await handleGoodreadsSync(expiredReq);
    expect(expiredRes.status).toBe(401);
  });

  it('runs Goodreads sync via Bearer fallback and calls revalidateTag("contentful", "max") when books change', async () => {
    mockRunGoodreadsSync.mockResolvedValue({
      created: 1,
      createdCount: 1,
      durationMs: 120,
      errors: [],
      goodreadsItemsFetched: 2,
      ok: true,
      revalidated: true,
      scanned: 2,
      skippedCount: 1,
      unchanged: 1,
      updated: 0,
      updatedCount: 0,
    });

    const req = new NextRequest('http://localhost/api/books/goodreads-sync', {
      headers: { authorization: 'Bearer test-cron-secret' },
      method: 'GET',
    });

    const res = await handleGoodreadsSync(req);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(mockRevalidateTag).toHaveBeenCalledWith('contentful', 'max');
  });
});
