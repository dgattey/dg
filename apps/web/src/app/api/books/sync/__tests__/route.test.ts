import { NextRequest } from 'next/server';

const mockUnpublishAndDeleteBook = jest.fn();

jest.mock('@dg/services/contentful/contentfulCmaClient', () => ({
  ContentfulCmaClient: jest.fn().mockImplementation(() => ({
    unpublishAndDeleteBook: mockUnpublishAndDeleteBook,
  })),
}));

jest.mock('@dg/services/contentful/syncBooksToContentful', () => ({
  upsertBookToContentful: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { upsertBookToContentful } from '@dg/services/contentful/syncBooksToContentful';
import {
  computeSagaHmacSignature,
  SAGA_SIGNATURE_HEADER,
  SAGA_TIMESTAMP_HEADER,
} from '@dg/services/contentful/verifySagaRequestAuth';
import { revalidateTag } from 'next/cache';
import { handleBooksSync } from '../route';

const mockUpsertBook = jest.mocked(upsertBookToContentful);
const mockRevalidateTag = jest.mocked(revalidateTag);

describe('Books mutation/sync API route', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.SAGA_API_SECRET = 'test-saga-hmac-secret';
    process.env.CONTENTFUL_SPACE_ID = 'space-id';
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = 'cma-token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects unauthorized requests and expired HMAC timestamps', async () => {
    const req = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({ upserts: [{ id: '1', title: 'Test' }] }),
      method: 'POST',
    });
    const res = await handleBooksSync(req);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized', ok: false });

    const body = JSON.stringify({ upserts: [{ id: '1', title: 'Test' }] });
    const expiredTs = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
    const sig = computeSagaHmacSignature({
      method: 'POST',
      pathname: '/api/books/sync',
      rawBody: body,
      secret: 'test-saga-hmac-secret',
      timestamp: expiredTs,
    });
    const expiredReq = new NextRequest('http://localhost/api/books/sync', {
      body,
      headers: {
        'content-type': 'application/json',
        [SAGA_SIGNATURE_HEADER]: sig,
        [SAGA_TIMESTAMP_HEADER]: expiredTs,
      },
      method: 'POST',
    });
    const expiredRes = await handleBooksSync(expiredReq);
    expect(expiredRes.status).toBe(401);
    expect(mockUpsertBook).not.toHaveBeenCalled();
  });

  it('processes Saga BookServerSyncRequest with upserts, deleteIds, reviewPlainText, and coverAssetId', async () => {
    mockUnpublishAndDeleteBook.mockResolvedValue(true);
    mockUpsertBook.mockResolvedValue({
      action: 'updated',
      author: 'Ray Bradbury',
      coverAssetId: 'ASSET-1',
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

    const rawBody = JSON.stringify({
      deleteIds: ['BOOK-DEL-1'],
      upserts: [
        {
          author: 'Ray Bradbury',
          coverAssetId: 'ASSET-1',
          id: 'BOOK-123',
          isbn: 9780007491568,
          rating: 5,
          readDateFinished: '2026-01-10T00:00:00Z',
          readDateStarted: '2026-01-01T00:00:00Z',
          reviewPlainText: 'Great read.',
          title: 'Fahrenheit 451',
        },
      ],
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = computeSagaHmacSignature({
      method: 'POST',
      pathname: '/api/books/sync',
      rawBody,
      secret: 'test-saga-hmac-secret',
      timestamp,
    });

    const req = new NextRequest('http://localhost/api/books/sync', {
      body: rawBody,
      headers: {
        authorization: 'Bearer test-saga-hmac-secret',
        'content-type': 'application/json',
        [SAGA_SIGNATURE_HEADER]: signature,
        [SAGA_TIMESTAMP_HEADER]: timestamp,
      },
      method: 'POST',
    });

    const res = await handleBooksSync(req);
    expect(res.status).toBe(200);
    expect(mockUnpublishAndDeleteBook).toHaveBeenCalledWith('BOOK-DEL-1');
    expect(mockUpsertBook).toHaveBeenCalledWith(expect.anything(), {
      author: 'Ray Bradbury',
      coverAssetId: 'ASSET-1',
      id: 'BOOK-123',
      isbn: 9780007491568,
      rating: 5,
      readDateFinished: '2026-01-10T00:00:00Z',
      readDateStarted: '2026-01-01T00:00:00Z',
      reviewPlainText: 'Great read.',
      title: 'Fahrenheit 451',
    });
    expect(res.body).toMatchObject({
      deleted: 1,
      ok: true,
      revalidated: true,
      upserted: 1,
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith('contentful', 'max');
  });

  it('rejects disallowed coverImageUrl hosts (SSRF protection) and out-of-bounds payloads with 400', async () => {
    const ssrfReq = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({
        upserts: [
          {
            coverImageUrl: 'https://169.254.169.254/latest/meta-data/',
            id: '1',
            title: 'SSRF Book',
          },
        ],
      }),
      headers: {
        authorization: 'Bearer test-cron-secret',
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    const ssrfRes = await handleBooksSync(ssrfReq);
    expect(ssrfRes.status).toBe(400);
    expect(ssrfRes.body).toEqual({
      error: expect.stringContaining(
        'Book coverImageUrl must be an HTTPS URL from an allowed cover host',
      ),
      ok: false,
    });

    const invalidRatingReq = new NextRequest('http://localhost/api/books/sync', {
      body: JSON.stringify({
        upserts: [{ id: '1', rating: 99, title: 'Bad Rating Book' }],
      }),
      headers: {
        authorization: 'Bearer test-cron-secret',
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    const invalidRatingRes = await handleBooksSync(invalidRatingReq);
    expect(invalidRatingRes.status).toBe(400);
    expect(invalidRatingRes.body).toEqual({
      error: 'Book rating must be an integer between 1 and 5',
      ok: false,
    });
  });
});
