import {
  buildCmaBookFields,
  buildGoodreadsRssUrl,
  buildRichTextDocument,
  ContentfulCmaClient,
  computeBookDiff,
  extractPlainTextFromRichText,
  findMatchingContentfulEntry,
  mergeShelfBooks,
  normalizeContentfulBookEntry,
  parseGoodreadsRssXml,
  parseIsbn13Number,
  resolveBestCoverUrl,
  resolveIsbnFromOpenLibrary,
  resolveReadDates,
  runGoodreadsSync,
  upgradeGoodreadsCoverUrl,
} from '../booksServer';

const SAMPLE_READ_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dylan's bookshelf: read</title>
    <item>
      <guid>https://www.goodreads.com/review/show/1001</guid>
      <pubDate>Wed, 15 Jan 2025 06:00:00 -0800</pubDate>
      <title><![CDATA[Three Cups of Tea: One Man's Mission to Promote Peace ... One School at a Time]]></title>
      <book_id>4929</book_id>
      <book_large_image_url><![CDATA[https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1348499866l/4929._SX318_.jpg]]></book_large_image_url>
      <author_name>Greg Mortenson</author_name>
      <isbn>0143038257</isbn>
      <user_rating>4</user_rating>
      <user_read_at><![CDATA[Wed, 15 Jan 2019 06:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Tue, 01 Jan 2019 06:00:00 +0000]]></user_date_added>
      <user_date_created><![CDATA[Tue, 01 Jan 2019 06:00:00 +0000]]></user_date_created>
      <user_shelves>read</user_shelves>
      <user_review><![CDATA[An inspiring story.<br/><br/>Highly recommended &amp; memorable.]]></user_review>
      <book description=""><![CDATA[<p>desc</p>]]></book>
      <num_pages>349</num_pages>
      <book_published>2006</book_published>
    </item>
  </channel>
</rss>`;

const SAMPLE_CURRENTLY_READING_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Urban Jungle: The History and Future of Nature in the City]]></title>
      <book_id>62919402</book_id>
      <book_large_image_url><![CDATA[https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png]]></book_large_image_url>
      <author_name>Ben Wilson</author_name>
      <isbn>9780385545938</isbn>
      <user_rating>0</user_rating>
      <user_read_at></user_read_at>
      <user_date_added><![CDATA[Fri, 23 Jan 2026 06:00:00 +0000]]></user_date_added>
      <user_date_created><![CDATA[Fri, 23 Jan 2026 06:00:00 +0000]]></user_date_created>
      <user_shelves>currently-reading</user_shelves>
      <user_review></user_review>
      <num_pages>384</num_pages>
      <book_published>2023</book_published>
    </item>
  </channel>
</rss>`;

describe('booksServer', () => {
  it('converts ISBN-10 and ISBN-13 accurately', () => {
    expect(parseIsbn13Number('0143038257')).toBe(9780143038252);
    expect(parseIsbn13Number('="9780316010665"')).toBe(9780316010665);
    expect(parseIsbn13Number('978-0-385-54593-8')).toBe(9780385545938);
    expect(parseIsbn13Number('')).toBeNull();
    expect(parseIsbn13Number('invalid')).toBeNull();
  });

  it('parses read and currently-reading shelves from Goodreads RSS XML', () => {
    const readItems = parseGoodreadsRssXml(SAMPLE_READ_RSS, 'read');
    expect(readItems).toHaveLength(1);
    const book = readItems[0];
    expect(book?.title).toBe(
      "Three Cups of Tea: One Man's Mission to Promote Peace ... One School at a Time",
    );
    expect(book?.author).toBe('Greg Mortenson');
    expect(book?.isbn).toBe(9780143038252);
    expect(book?.rating).toBe(4);
    expect(book?.status).toBe('read');
    expect(book?.readDateStarted).toBe('2019-01-01T06:00:00Z');
    expect(book?.readDateFinished).toBe('2019-01-15T06:00:00Z');
    expect(book?.reviewText).toBe('An inspiring story.\n\nHighly recommended & memorable.');
    expect(book?.goodreadsCoverUrl).toBe(
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1348499866l/4929.jpg',
    );

    const readingItems = parseGoodreadsRssXml(SAMPLE_CURRENTLY_READING_RSS, 'currently-reading');
    expect(readingItems).toHaveLength(1);
    const readingBook = readingItems[0];
    expect(readingBook?.status).toBe('reading');
    expect(readingBook?.rating).toBeNull();
    expect(readingBook?.readDateStarted).toBe('2026-01-23T06:00:00Z');
    expect(readingBook?.readDateFinished).toBeNull();
    expect(readingBook?.goodreadsCoverUrl).toBeNull();
  });

  it('round-trips buildRichTextDocument and extractPlainTextFromRichText', () => {
    const doc = buildRichTextDocument('First paragraph<br/><br/>Second &amp; final paragraph');
    expect(doc).toEqual({
      content: [
        {
          content: [{ data: {}, marks: [], nodeType: 'text', value: 'First paragraph' }],
          data: {},
          nodeType: 'paragraph',
        },
        {
          content: [{ data: {}, marks: [], nodeType: 'text', value: 'Second & final paragraph' }],
          data: {},
          nodeType: 'paragraph',
        },
      ],
      data: {},
      nodeType: 'document',
    });
    expect(extractPlainTextFromRichText(doc)).toBe('First paragraph\n\nSecond & final paragraph');
  });

  it('deduplicates and prioritizes read over currently-reading in mergeShelfBooks', () => {
    const [readingItem] = parseGoodreadsRssXml(SAMPLE_CURRENTLY_READING_RSS, 'currently-reading');
    if (!readingItem) {
      throw new Error('Expected readingItem');
    }
    const finishedItem = {
      ...readingItem,
      rating: 5,
      readDateFinished: '2026-02-10T06:00:00Z',
      shelf: 'read',
      status: 'read' as const,
    };

    const merged = mergeShelfBooks([readingItem, finishedItem]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.status).toBe('read');
    expect(merged[0]?.rating).toBe(5);
    expect(merged[0]?.readDateFinished).toBe('2026-02-10T06:00:00Z');
  });

  it('skips unchanged books and detects status/rating/review transitions in computeBookDiff', () => {
    const existingCmaEntry = normalizeContentfulBookEntry({
      fields: {
        author: { 'en-US': 'Greg Mortenson' },
        coverImage: {
          'en-US': { sys: { id: 'ASSET-1', linkType: 'Asset', type: 'Link' } },
        },
        isbn: { 'en-US': 9780143038252 },
        rating: { 'en-US': 4 },
        readDateFinished: { 'en-US': '2019-01-15T06:00:00Z' },
        readDateStarted: { 'en-US': '2019-01-01T06:00:00Z' },
        reviewDescription: {
          'en-US': buildRichTextDocument(
            'An inspiring story.<br/><br/>Highly recommended &amp; memorable.',
          ),
        },
        title: {
          'en-US': "Three Cups of Tea: One Man's Mission to Promote Peace ... One School at a Time",
        },
      },
      sys: { id: 'BOOK-1', publishedVersion: 1, version: 2 },
    });

    const [rssBook] = parseGoodreadsRssXml(SAMPLE_READ_RSS, 'read');
    if (!rssBook) {
      throw new Error('Expected rssBook');
    }
    const matched = findMatchingContentfulEntry(rssBook, [existingCmaEntry]);
    expect(matched?.id).toBe('BOOK-1');

    const unchangedDiff = computeBookDiff(rssBook, matched);
    expect(unchangedDiff.action).toBe('skip');
    expect(unchangedDiff.changedFields).toEqual([]);

    const currentlyReadingEntry = normalizeContentfulBookEntry({
      fields: {
        author: { 'en-US': 'Ben Wilson' },
        coverImage: {
          'en-US': { sys: { id: 'ASSET-2', linkType: 'Asset', type: 'Link' } },
        },
        isbn: { 'en-US': 9780385545938 },
        readDateStarted: { 'en-US': '2026-01-23T06:00:00Z' },
        title: { 'en-US': 'Urban Jungle: The History and Future of Nature in the City' },
      },
      sys: { id: 'BOOK-2', publishedVersion: 3, version: 4 },
    });

    const [readingBook] = parseGoodreadsRssXml(SAMPLE_CURRENTLY_READING_RSS, 'currently-reading');
    if (!readingBook) {
      throw new Error('Expected readingBook');
    }

    const finishedUrbanJungle = {
      ...readingBook,
      rating: 5,
      readDateFinished: '2026-03-01T06:00:00Z',
      reviewDescription: buildRichTextDocument('Fantastic urban history.'),
      reviewText: 'Fantastic urban history.',
      status: 'read' as const,
    };

    const transitionDiff = computeBookDiff(finishedUrbanJungle, currentlyReadingEntry);
    expect(transitionDiff.action).toBe('update');
    expect(transitionDiff.changedFields).toEqual([
      'rating',
      'reviewDescription',
      'readDateFinished',
    ]);

    const cmaFields = buildCmaBookFields(transitionDiff.merged);
    expect(cmaFields.rating?.['en-US']).toBe(5);
    expect(cmaFields.readDateStarted?.['en-US']).toBe('2026-01-23T06:00:00Z');
    expect(cmaFields.readDateFinished?.['en-US']).toBe('2026-03-01T06:00:00Z');
    expect((cmaFields.coverImage?.['en-US'] as { sys?: { id?: string } })?.sys?.id).toBe('ASSET-2');
  });

  it('orchestrates RSS polling and Contentful diffing in runGoodreadsSync dry-run', async () => {
    const mockFetch: typeof fetch = (input) => {
      const urlStr = String(input);
      if (urlStr.includes('shelf=read')) {
        return Promise.resolve(new Response(SAMPLE_READ_RSS, { status: 200 }));
      }
      if (urlStr.includes('shelf=currently-reading')) {
        return Promise.resolve(new Response(SAMPLE_CURRENTLY_READING_RSS, { status: 200 }));
      }
      if (urlStr.includes('shelf=to-read')) {
        return Promise.resolve(new Response('<rss><channel></channel></rss>', { status: 200 }));
      }
      if (urlStr.includes('api.contentful.com')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              items: [
                {
                  fields: {
                    author: { 'en-US': 'Greg Mortenson' },
                    coverImage: {
                      'en-US': { sys: { id: 'ASSET-1', linkType: 'Asset', type: 'Link' } },
                    },
                    isbn: { 'en-US': 9780143038252 },
                    rating: { 'en-US': 4 },
                    readDateFinished: { 'en-US': '2019-01-15T06:00:00Z' },
                    readDateStarted: { 'en-US': '2019-01-01T06:00:00Z' },
                    reviewDescription: {
                      'en-US': buildRichTextDocument(
                        'An inspiring story.<br/><br/>Highly recommended &amp; memorable.',
                      ),
                    },
                    title: {
                      'en-US':
                        "Three Cups of Tea: One Man's Mission to Promote Peace ... One School at a Time",
                    },
                  },
                  sys: { id: 'EXISTING-1', publishedVersion: 1, version: 2 },
                },
              ],
              total: 1,
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('{}', { status: 404 }));
    };

    const result = await runGoodreadsSync({
      contentfulManagementToken: 'cma-token-1',
      contentfulSpaceId: 'space-1',
      dryRun: true,
      fetchImpl: mockFetch,
      goodreadsRssKey: 'secret-rss-key',
      goodreadsUserId: '12345',
    });

    expect(result.ok).toBe(true);
    expect(result.skippedCount).toBe(1);
    expect(result.createdCount).toBe(1);
    expect(result.created[0]?.title).toBe(
      'Urban Jungle: The History and Future of Nature in the City',
    );
  });

  it('falls back to Goodreads large image URL when OpenLibrary/Bookcover 404', async () => {
    const mockFetch: typeof fetch = () =>
      Promise.resolve(new Response('Not Found', { status: 404 }));
    const url = await resolveBestCoverUrl(
      {
        author: 'Greg Mortenson',
        goodreadsCoverUrl:
          'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1348499866l/4929._SY475_.jpg',
        isbn: 9780143038252,
        title: 'Three Cups of Tea',
      },
      mockFetch,
    );
    expect(url).toBe(
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1348499866l/4929.jpg',
    );
    expect(
      upgradeGoodreadsCoverUrl(
        'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png',
      ),
    ).toBeNull();
    expect(buildGoodreadsRssUrl({ rssKey: 'abc', shelf: 'read', userId: '999' })).toBe(
      'https://www.goodreads.com/review/list_rss/999?per_page=200&shelf=read&key=abc',
    );
  });

  it('matches GoodreadsCSVParser when finished < started in resolveReadDates', () => {
    const withReadAt = resolveReadDates({
      shelf: 'read',
      userDateAdded: '2019/01/15',
      userReadAt: '2012/01/13',
      userShelves: 'read',
    });
    expect(withReadAt.status).toBe('read');
    expect(withReadAt.readDateStarted).toBeNull();
    expect(withReadAt.readDateFinished).toBe('2012-01-13T00:00:00Z');

    const withoutReadAt = resolveReadDates({
      shelf: 'read',
      userDateAdded: '2019/01/15',
      userDateStarted: '2020/05/01',
      userReadAt: null,
      userShelves: 'read',
    });
    expect(withoutReadAt.status).toBe('reading');
    expect(withoutReadAt.readDateStarted).toBe('2020-05-01T00:00:00Z');
    expect(withoutReadAt.readDateFinished).toBeNull();
  });

  it('prioritizes English + author/title match and falls back to work editions in resolveIsbnFromOpenLibrary', async () => {
    const mockFetch: typeof fetch = (input) => {
      const urlStr = String(input);
      if (urlStr.includes('/search.json')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              docs: [
                {
                  author_name: ['Someone Else'],
                  editions: {
                    docs: [{ isbn: ['9781111111116'], title: 'Other Book' }],
                  },
                  key: '/works/OL1W',
                  language: ['fre'],
                  title: 'Other Book',
                },
                {
                  author_name: ['Ray Bradbury'],
                  editions: {
                    docs: [],
                  },
                  key: '/works/OL2W',
                  language: ['eng'],
                  title: 'Fahrenheit 451',
                },
              ],
            }),
            { status: 200 },
          ),
        );
      }
      if (urlStr.includes('/works/OL2W/editions.json')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              entries: [
                {
                  isbn_13: ['9780007491568'],
                  languages: [{ key: '/languages/eng' }],
                },
              ],
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('Not Found', { status: 404 }));
    };

    const isbn = await resolveIsbnFromOpenLibrary('Fahrenheit 451', 'Ray Bradbury', mockFetch);
    expect(isbn).toBe(9780007491568);
  });

  it('upserts and deletes books via ContentfulCmaClient', async () => {
    const calls: Array<{ method: string; url: string }> = [];
    const mockFetch: typeof fetch = (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({ method, url });

      if (url.endsWith('/entries/BOOK-123') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: {
                author: { 'en-US': 'Ray Bradbury' },
                coverImage: {
                  'en-US': { sys: { id: 'ASSET-EXISTING', linkType: 'Asset', type: 'Link' } },
                },
                isbn: { 'en-US': 9780007491568 },
                title: { 'en-US': 'Fahrenheit 451' },
              },
              sys: { id: 'BOOK-123', publishedVersion: 2, version: 3 },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.endsWith('/entries/BOOK-123') && method === 'PUT') {
        const parsed = JSON.parse(String(init?.body ?? '{}')) as {
          fields?: Record<string, unknown>;
        };
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: parsed.fields,
              sys: { id: 'BOOK-123', publishedVersion: 2, version: 4 },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.endsWith('/entries/BOOK-123/published') && method === 'PUT') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: {
                author: { 'en-US': 'Ray Bradbury' },
                coverImage: {
                  'en-US': { sys: { id: 'ASSET-EXISTING', linkType: 'Asset', type: 'Link' } },
                },
                isbn: { 'en-US': 9780007491568 },
                rating: { 'en-US': 5 },
                reviewDescription: {
                  'en-US': buildRichTextDocument('Timeless classic.'),
                },
                title: { 'en-US': 'Fahrenheit 451' },
              },
              sys: { id: 'BOOK-123', publishedVersion: 4, version: 5 },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.endsWith('/entries/BOOK-123/published') && method === 'DELETE') {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.endsWith('/entries/BOOK-123') && method === 'DELETE') {
        return Promise.resolve(new Response(null, { status: 204 }));
      }

      return Promise.resolve(new Response('{}', { status: 404 }));
    };

    const client = new ContentfulCmaClient({
      fetchImpl: mockFetch,
      managementToken: 'cma-token',
      spaceId: 'space-id',
    });

    const outcome = await client.upsertBook({
      author: 'Ray Bradbury',
      id: 'BOOK-123',
      isbn: '9780007491568',
      rating: 5,
      reviewText: 'Timeless classic.',
      title: 'Fahrenheit 451',
    });

    expect(outcome.action).toBe('updated');
    expect(outcome.id).toBe('BOOK-123');
    expect(outcome.rating).toBe(5);
    expect(outcome.reviewText).toBe('Timeless classic.');

    const deleted = await client.unpublishAndDeleteBook('BOOK-123');
    expect(deleted).toBe(true);
    expect(calls.some((c) => c.method === 'DELETE' && c.url.endsWith('/entries/BOOK-123'))).toBe(
      true,
    );
  });
});
