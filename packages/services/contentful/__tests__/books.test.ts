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
    expect(upserted.coverImageUrl).toBe('https://images.ctfassets.net/cov.jpg');

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

  it('uploads binary cover via CMA Upload API, enforces precedence over coverImageUrl/coverAssetId, and returns coverImageUrl', async () => {
    const calls: Array<{ body?: unknown; headers?: unknown; method: string; url: string }> = [];
    let uploadedAssetId = '';

    const fetchMock: typeof fetch = (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({ body: init?.body, headers: init?.headers, method, url });

      if (url === 'https://upload.contentful.com/spaces/sp/uploads' && method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ sys: { id: 'upload-bin-1' } })));
      }
      if (
        url.includes('/assets/') &&
        method === 'PUT' &&
        !url.endsWith('/process') &&
        !url.endsWith('/published')
      ) {
        uploadedAssetId = url.split('/assets/')[1] ?? 'BIN-ASSET-1';
        return Promise.resolve(
          new Response(JSON.stringify({ sys: { id: uploadedAssetId, version: 1 } })),
        );
      }
      if (url.includes('/assets/') && url.endsWith('/process') && method === 'PUT') {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.includes('/assets/') && url.endsWith('/published') && method === 'PUT') {
        return Promise.resolve(
          new Response(
            JSON.stringify({ sys: { id: uploadedAssetId, publishedVersion: 1, version: 2 } }),
          ),
        );
      }
      if (url.includes('/assets/') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: {
                file: {
                  'en-US': {
                    url: `//images.ctfassets.net/sp/${uploadedAssetId}/BOOK-42.png`,
                  },
                },
              },
              sys: { id: uploadedAssetId, version: 1 },
            }),
          ),
        );
      }
      if (url.includes('/entries/BOOK-42') && method === 'GET') {
        return Promise.resolve(new Response('Not found', { status: 404 }));
      }
      if (url.includes('/entries') && method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [], total: 0 })));
      }
      if (url.includes('/entries/BOOK-42') && method === 'PUT' && !url.endsWith('/published')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: {
                author: { 'en-US': 'Ursula K. Le Guin' },
                coverImage: { 'en-US': { sys: { id: uploadedAssetId } } },
                title: { 'en-US': 'The Left Hand of Darkness' },
              },
              sys: { id: 'BOOK-42', version: 1 },
            }),
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            fields: {
              author: { 'en-US': 'Ursula K. Le Guin' },
              coverImage: { 'en-US': { sys: { id: uploadedAssetId } } },
              title: { 'en-US': 'The Left Hand of Darkness' },
            },
            sys: { id: 'BOOK-42', publishedVersion: 1, version: 2 },
          }),
        ),
      );
    };

    const cma = new ContentfulCmaClient({
      fetchImpl: fetchMock,
      managementToken: 'tok',
      spaceId: 'sp',
    });

    const rawBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const b64 = Buffer.from(rawBytes).toString('base64');

    const outcome = await upsertBookToContentful(cma, {
      author: 'Ursula K. Le Guin',
      coverAssetId: 'IGNORED-OLD-ASSET',
      coverImageBase64: b64,
      coverImageContentType: 'image/png',
      coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg',
      id: 'BOOK-42',
      title: 'The Left Hand of Darkness',
    });

    expect(outcome.action).toBe('created');
    expect(outcome.id).toBe('BOOK-42');
    expect(outcome.coverAssetId).toBe(uploadedAssetId);
    expect(outcome.coverAssetId).not.toBe('IGNORED-OLD-ASSET');
    expect(outcome.coverImageUrl).toBe(
      `https://images.ctfassets.net/sp/${uploadedAssetId}/BOOK-42.png`,
    );

    const uploadCall = calls.find(
      (c) => c.url === 'https://upload.contentful.com/spaces/sp/uploads',
    );
    expect(uploadCall).toBeDefined();
    expect(uploadCall?.headers).toEqual({
      Authorization: 'Bearer tok',
      'Content-Type': 'application/octet-stream',
    });
    expect(new Uint8Array(uploadCall?.body as ArrayBufferLike)).toEqual(rawBytes);

    const putAssetCall = calls.find(
      (c) =>
        c.url.includes(`/assets/${uploadedAssetId}`) &&
        c.method === 'PUT' &&
        !c.url.endsWith('/process') &&
        !c.url.endsWith('/published'),
    );
    expect(JSON.parse(String(putAssetCall?.body))).toEqual({
      fields: {
        file: {
          'en-US': {
            contentType: 'image/png',
            fileName: 'BOOK-42.png',
            uploadFrom: {
              sys: {
                id: 'upload-bin-1',
                linkType: 'Upload',
                type: 'Link',
              },
            },
          },
        },
        title: { 'en-US': 'The Left Hand of Darkness' },
      },
    });
  });

  it('populates coverImageUrl when uploading cover via coverImageUrl download path', async () => {
    let createdAssetId = '';
    const fetchMock: typeof fetch = (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      if (url.includes('/entries') && method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [], total: 0 })));
      }
      if (
        url.includes('/assets/') &&
        method === 'PUT' &&
        !url.endsWith('/process') &&
        !url.endsWith('/published')
      ) {
        createdAssetId = url.split('/assets/')[1] ?? 'URL-ASSET-1';
        return Promise.resolve(
          new Response(JSON.stringify({ sys: { id: createdAssetId, version: 1 } })),
        );
      }
      if (url.includes('/assets/') && url.endsWith('/process')) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.includes('/assets/') && url.endsWith('/published')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ sys: { id: createdAssetId, publishedVersion: 1, version: 2 } }),
          ),
        );
      }
      if (url.includes('/assets/') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: {
                file: {
                  'en-US': {
                    url: `//images.ctfassets.net/sp/${createdAssetId}/cover.jpg`,
                  },
                },
              },
              sys: { id: createdAssetId, version: 1 },
            }),
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            fields: {
              author: { 'en-US': 'Isaac Asimov' },
              coverImage: { 'en-US': { sys: { id: createdAssetId } } },
              title: { 'en-US': 'Foundation' },
            },
            sys: { id: 'BOOK-FOUNDATION', publishedVersion: 1, version: 2 },
          }),
        ),
      );
    };

    const cma = new ContentfulCmaClient({
      fetchImpl: fetchMock,
      managementToken: 'tok',
      spaceId: 'sp',
    });
    const outcome = await upsertBookToContentful(cma, {
      author: 'Isaac Asimov',
      coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg',
      id: 'BOOK-FOUNDATION',
      title: 'Foundation',
    });
    expect(outcome.coverAssetId).toBe(createdAssetId);
    expect(outcome.coverImageUrl).toBe(
      `https://images.ctfassets.net/sp/${createdAssetId}/cover.jpg`,
    );
  });
});
