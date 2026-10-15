import crypto from 'node:crypto';
import { ContentfulCmaClient } from '../contentfulCmaClient';
import {
  resolveCoverUrl,
  runGoodreadsSync,
  upsertBookToContentful,
} from '../syncBooksToContentful';
import { computeSagaHmacSignature, verifySagaRequestAuth } from '../verifySagaRequestAuth';

describe('verifySagaRequestAuth', () => {
  const secret = 'test-hmac-secret';
  const env = { NODE_ENV: 'test', SAGA_API_SECRET: secret } as const;
  const body = JSON.stringify({ upserts: [{ id: '1', title: 'Dune' }] });
  const pathname = '/api/books/sync';

  it('accepts valid HMAC-SHA256 signatures and rejects replays or bad signatures', () => {
    const nowMs = 1_700_000_000_000;
    const timestamp = String(Math.floor(nowMs / 1000));
    const sig = computeSagaHmacSignature({
      method: 'POST',
      pathname,
      rawBody: body,
      secret,
      timestamp,
    });
    expect(
      verifySagaRequestAuth({
        authorizationHeader: `Bearer ${secret}`,
        env,
        method: 'POST',
        nowMs,
        pathname,
        rawBody: body,
        signatureHeader: sig,
        timestampHeader: timestamp,
      }),
    ).toEqual({ method: 'hmac', ok: true });

    expect(
      verifySagaRequestAuth({
        env,
        method: 'POST',
        nowMs,
        pathname,
        rawBody: body,
        signatureHeader: sig,
        timestampHeader: '1000',
      }),
    ).toEqual({ ok: false, reason: 'expired_timestamp' });
  });

  it('supports timing-safe Bearer token fallback', () => {
    expect(
      verifySagaRequestAuth({
        authorizationHeader: `Bearer ${secret}`,
        env,
        method: 'POST',
        pathname,
      }),
    ).toEqual({ method: 'bearer', ok: true });

    expect(
      verifySagaRequestAuth({
        authorizationHeader: `Bearer ${crypto.randomBytes(8).toString('hex')}`,
        env,
        method: 'POST',
        pathname,
      }),
    ).toEqual({ ok: false, reason: 'invalid_bearer_token' });
  });
});

describe('ContentfulCmaClient & syncBooksToContentful', () => {
  it('resolves cover URLs directly from Goodreads or OpenLibrary ISBN', () => {
    expect(
      resolveCoverUrl({ goodreadsCoverUrl: 'https://i.gr-assets.com/images/1._SX98_.jpg' }),
    ).toBe('https://i.gr-assets.com/images/1.jpg');
    expect(resolveCoverUrl({ isbn: 9780441172719 })).toBe(
      'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg?default=false',
    );
    expect(resolveCoverUrl({})).toBeNull();
  });

  it('upserts books and runs Goodreads sync against Contentful CMA without fallback assets', async () => {
    const fetchMock: typeof fetch = (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      if (url.includes('goodreads.com')) {
        return Promise.resolve(
          new Response(
            `<rss><channel><item>
              <book_id>1</book_id><title>Dune</title><author_name>Frank Herbert</author_name>
              <isbn13>9780441172719</isbn13><user_rating>5</user_rating>
              <user_read_at>2025/03/10</user_read_at>
              <book_large_image_url>https://i.gr-assets.com/images/1.jpg</book_large_image_url>
            </item></channel></rss>`,
          ),
        );
      }
      if (url.includes('/entries') && method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [], total: 0 })));
      }
      if (url.includes('/assets/') && url.endsWith('/published')) {
        return Promise.resolve(
          new Response(JSON.stringify({ sys: { id: 'cov-1', publishedVersion: 1, version: 2 } })),
        );
      }
      if (url.includes('/assets/')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: { file: { 'en-US': { url: '//images.ctfassets.net/cov.jpg' } } },
              sys: { id: 'cov-1', version: 1 },
            }),
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            fields: {
              author: { 'en-US': 'Frank Herbert' },
              coverImage: { 'en-US': { sys: { id: 'cov-1' } } },
              isbn: { 'en-US': 9780441172719 },
              rating: { 'en-US': 5 },
              title: { 'en-US': 'Dune' },
            },
            sys: { id: 'BOOK_1', publishedVersion: 1, version: 2 },
          }),
        ),
      );
    };

    const cma = new ContentfulCmaClient({
      fetchImpl: fetchMock,
      managementToken: 'tok',
      spaceId: 'sp',
    });
    const upserted = await upsertBookToContentful(cma, {
      author: 'Frank Herbert',
      coverAssetId: 'cov-1',
      isbn: 9780441172719,
      rating: 5,
      reviewPlainText: 'Excellent.',
      title: 'Dune',
    });
    expect(upserted.action).toBe('created');
    expect(upserted.coverAssetId).toBe('cov-1');

    const syncSummary = await runGoodreadsSync({
      contentfulManagementToken: 'tok',
      contentfulSpaceId: 'sp',
      fetchImpl: fetchMock,
      goodreadsUserId: 'u1',
      shelves: ['read'],
    });
    expect(syncSummary.ok).toBe(true);
    expect(syncSummary.createdCount).toBe(1);
  });
});
