import { NextRequest } from 'next/server';

jest.mock('@dg/services/contentful/booksServer', () => {
  const actual = jest.requireActual('@dg/services/contentful/booksServer');
  return {
    ...actual,
    runGoodreadsSync: jest.fn(),
  };
});

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import * as booksServer from '@dg/services/contentful/booksServer';
import { revalidateTag } from 'next/cache';
import { handleGoodreadsSync } from '../route';

const mockRunGoodreadsSync = jest.mocked(booksServer.runGoodreadsSync);
const mockRevalidateTag = jest.mocked(revalidateTag);

describe('Goodreads sync API route', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.GOODREADS_USER_ID = '987654';
    process.env.GOODREADS_RSS_KEY = 'rss-key';
    process.env.CONTENTFUL_SPACE_ID = 'space-id';
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = 'cma-token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects requests without a matching Bearer CRON_SECRET', async () => {
    const req = new NextRequest('http://localhost/api/books/goodreads-sync', {
      method: 'POST',
    });
    const res = await handleGoodreadsSync(req);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized', ok: false });
    expect(mockRunGoodreadsSync).not.toHaveBeenCalled();
  });

  it('runs Goodreads sync and calls revalidateTag("contentful") when books are created or updated', async () => {
    mockRunGoodreadsSync.mockResolvedValue({
      applicableBooksCount: 2,
      created: [
        {
          author: 'Ben Wilson',
          changedFields: ['title', 'author'],
          status: 'reading',
          title: 'Urban Jungle',
        },
      ],
      createdCount: 1,
      dryRun: false,
      durationMs: 120,
      errors: [],
      existingContentfulBooksCount: 120,
      goodreadsItemsFetched: 2,
      ok: true,
      shelvesPolled: ['currently-reading', 'read'],
      skippedCount: 1,
      updated: [],
      updatedCount: 0,
    });

    const req = new NextRequest('http://localhost/api/books/goodreads-sync', {
      headers: { authorization: 'Bearer test-cron-secret' },
      method: 'POST',
    });

    const res = await handleGoodreadsSync(req);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(mockRevalidateTag).toHaveBeenCalledWith('contentful', 'max');
  });

  it('skips revalidateTag on dryRun or when no books changed', async () => {
    mockRunGoodreadsSync.mockResolvedValue({
      applicableBooksCount: 1,
      created: [],
      createdCount: 0,
      dryRun: true,
      durationMs: 50,
      errors: [],
      existingContentfulBooksCount: 121,
      goodreadsItemsFetched: 1,
      ok: true,
      shelvesPolled: ['currently-reading', 'read'],
      skippedCount: 1,
      updated: [],
      updatedCount: 0,
    });

    const req = new NextRequest('http://localhost/api/books/goodreads-sync?dryRun=true', {
      headers: { authorization: 'Bearer test-cron-secret' },
      method: 'GET',
    });

    const res = await handleGoodreadsSync(req);
    expect(res.status).toBe(200);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });
});
