import {
  buildRichTextDocument,
  cleanWhitespace,
  DEFAULT_SHELVES,
  isUsableGoodreadsCoverUrl,
  normalizeReviewText,
  parseIsbn13Number,
  type ReadingStatus,
  upgradeGoodreadsCoverUrl,
} from '../bookDomain';
import {
  type BookMutationInput,
  validateBookMutationInput,
  validateBooksSyncPayload,
} from '../bookSchema';
import {
  buildCmaBookFields,
  computeBookDiff,
  findMatchingContentfulEntry,
  type MergedBookFields,
  type NormalizedContentfulBookEntry,
  normalizeContentfulBookEntry,
} from '../contentfulBook';
import {
  buildGoodreadsRssUrl,
  type GoodreadsBookItem,
  mergeShelfBooks,
  parseGoodreadsRssXml,
} from '../goodreadsRss';

describe('bookDomain & bookSchema', () => {
  it('normalizes ISBN-10/13, builds RichText, and upgrades Goodreads cover URLs', () => {
    expect(parseIsbn13Number('0441172717')).toBe(9780441172719);
    expect(parseIsbn13Number('="978-0-441-17271-9"')).toBe(9780441172719);
    expect(parseIsbn13Number(9780441172719)).toBe(9780441172719);
    expect(parseIsbn13Number(123)).toBeNull();
    expect(buildRichTextDocument('First<br/>Second &amp; line')?.content).toHaveLength(2);
    expect(isUsableGoodreadsCoverUrl('https://i.gr-assets.com/images/nophoto/book.png')).toBe(
      false,
    );
    expect(upgradeGoodreadsCoverUrl('https://i.gr-assets.com/images/123._SY75_.jpg')).toBe(
      'https://i.gr-assets.com/images/123.jpg',
    );
  });

  it('validates Saga BookServerSyncRequest payloads with upserts, deleteIds, reviewPlainText, and coverAssetId', () => {
    const sagaPayload = validateBooksSyncPayload({
      deleteIds: ['DEL-1', 'DEL-1'],
      upserts: [
        {
          author: '  Frank   Herbert ',
          coverAssetId: 'ASSET-99',
          coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
          id: 'BOOK-1',
          isbn: 9780441172719,
          rating: 5,
          readDateFinished: '2025-03-01T00:00:00Z',
          readDateStarted: '2025-02-01T00:00:00Z',
          reviewPlainText: 'A classic.',
          title: '  Dune ',
        },
      ],
    });
    expect(sagaPayload).toEqual({
      data: {
        booksToUpsert: [
          {
            author: 'Frank Herbert',
            coverAssetId: 'ASSET-99',
            coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
            id: 'BOOK-1',
            isbn: 9780441172719,
            rating: 5,
            readDateFinished: '2025-03-01T00:00:00Z',
            readDateStarted: '2025-02-01T00:00:00Z',
            reviewPlainText: 'A classic.',
            title: 'Dune',
          },
        ],
        deletedIdsToProcess: ['DEL-1'],
      },
      ok: true,
    });

    expect(validateBooksSyncPayload({})).toEqual({
      error: 'Request must include at least one book in upserts or id in deleteIds',
      ok: false,
    });
    expect(
      validateBookMutationInput({ coverImageUrl: 'https://evil.example/x.jpg', title: 'Dune' }).ok,
    ).toBe(false);
  });
});

describe('goodreadsRss & contentfulBook', () => {
  it('parses Goodreads RSS XML, merges shelves, and computes Contentful diffs', () => {
    const xml = `<rss><channel><item>
      <book_id>42</book_id><title><![CDATA[Dune]]></title><author_name>Frank Herbert</author_name>
      <isbn>0441172717</isbn><user_rating>5</user_rating>
      <user_read_at>2025/03/10</user_read_at><user_date_started>2025/03/01</user_date_started>
      <user_review><![CDATA[Masterpiece.]]></user_review>
      <book_large_image_url>https://i.gr-assets.com/images/42._SX98_.jpg</book_large_image_url>
    </item></channel></rss>`;
    const parsed = parseGoodreadsRssXml(xml, 'read');
    const firstItem = parsed[0];
    if (!firstItem) throw new Error('expected parsed item');
    expect(firstItem.goodreadsCoverUrl).toBe('https://i.gr-assets.com/images/42.jpg');
    expect(firstItem.isbn).toBe(9780441172719);
    expect(mergeShelfBooks([{ ...firstItem, status: 'reading' }, firstItem])[0]?.status).toBe(
      'read',
    );
    expect(buildGoodreadsRssUrl({ rssKey: 'k', shelf: 'read', userId: 'u1' })).toContain(
      'review/list_rss/u1?per_page=200&shelf=read&key=k',
    );

    const entry: NormalizedContentfulBookEntry = normalizeContentfulBookEntry({
      fields: {
        author: { 'en-US': 'Frank Herbert' },
        coverImage: { 'en-US': { sys: { id: 'cov-1' } } },
        isbn: { 'en-US': 9780441172719 },
        rating: { 'en-US': 4 },
        title: { 'en-US': 'Dune' },
      },
      sys: { id: 'B1', publishedVersion: 2, version: 3 },
    });
    expect(findMatchingContentfulEntry(firstItem, [entry])?.id).toBe('B1');
    const diff = computeBookDiff(firstItem, entry);
    expect(diff.action).toBe('update');
    expect(diff.changedFields).toEqual([
      'rating',
      'reviewDescription',
      'readDateFinished',
      'readDateStarted',
    ]);
    const cmaFields = buildCmaBookFields(diff.merged);
    expect(cmaFields.rating).toEqual({ 'en-US': 5 });
    expect(cleanWhitespace(' a  b ')).toBe('a b');
    expect(normalizeReviewText('a\n\nb')).toBe('a\n\nb');
    expect(DEFAULT_SHELVES).toEqual(['currently-reading', 'read']);
    const _typeCheck: [
      BookMutationInput | null,
      GoodreadsBookItem,
      MergedBookFields,
      ReadingStatus,
    ] = [null, firstItem, diff.merged, firstItem.status];
    expect(_typeCheck[1].title).toBe('Dune');
  });
});
