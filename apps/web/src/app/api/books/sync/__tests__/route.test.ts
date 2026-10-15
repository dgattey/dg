import { NextRequest } from 'next/server';

const mockUpsertBook = jest.fn();
const mockUnpublishAndDeleteBook = jest.fn();

jest.mock('@dg/services/contentful/booksServer', () => {
  const actual = jest.requireActual('@dg/services/contentful/booksServer');
  return {
    ...actual,
    ContentfulCmaClient: jest.fn().mockImplementation(() => ({
      unpublishAndDeleteBook: mockUnpublishAndDeleteBook,
      upsertBook: mockUpsertBook,
    })),
  };
});

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { revalidateTag } from 'next/cache';
import { handleBooksSync } from '../route';

const mockRevalidateTag = jest.mocked(revalidateTag);

describe('Books mutation/sync API route', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.CONTENTFUL_SPACE_ID = 'space-id';
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = 'cma-token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects unauthorized requests', async () => {
    const req = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({ title: 'Test' }),
      method: 'POST',
    });
    const res = await handleBooksSync(req);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized', ok: false });
  });

  it('upserts local book edits and revalidates contentful tag', async () => {
    mockUpsertBook.mockResolvedValue({
      action: 'updated',
      author: 'Ray Bradbury',
      coverImageId: 'ASSET-1',
      id: 'BOOK-123',
      isbn: 9780007491568,
      rating: 5,
      readDateFinished: '2026-01-10T00:00:00Z',
      readDateStarted: '2026-01-01T00:00:00Z',
      reviewText: 'Great read.',
      title: 'Fahrenheit 451',
      version: 4,
    });

    const req = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({
        author: 'Ray Bradbury',
        id: 'BOOK-123',
        isbn: '9780007491568',
        rating: 5,
        reviewText: 'Great read.',
        title: 'Fahrenheit 451',
      }),
      headers: {
        authorization: 'Bearer test-cron-secret',
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    const res = await handleBooksSync(req);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      deletedCount: 0,
      deletedIds: [],
      errors: [],
      ok: true,
      results: [
        {
          action: 'updated',
          author: 'Ray Bradbury',
          coverImageId: 'ASSET-1',
          id: 'BOOK-123',
          isbn: 9780007491568,
          rating: 5,
          readDateFinished: '2026-01-10T00:00:00Z',
          readDateStarted: '2026-01-01T00:00:00Z',
          reviewText: 'Great read.',
          title: 'Fahrenheit 451',
          version: 4,
        },
      ],
      upsertedCount: 1,
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith('contentful', 'max');
  });

  it('deletes books and revalidates contentful tag', async () => {
    mockUnpublishAndDeleteBook.mockResolvedValue(true);

    const req = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({
        action: 'delete',
        deletedIds: ['BOOK-DEL-1'],
      }),
      headers: {
        authorization: 'Bearer test-cron-secret',
        'content-type': 'application/json',
      },
      method: 'DELETE',
    });

    const res = await handleBooksSync(req);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      deletedCount: 1,
      deletedIds: ['BOOK-DEL-1'],
      errors: [],
      ok: true,
      results: [],
      upsertedCount: 0,
    });
    expect(mockUnpublishAndDeleteBook).toHaveBeenCalledWith('BOOK-DEL-1');
    expect(mockRevalidateTag).toHaveBeenCalledWith('contentful', 'max');
  });
});
