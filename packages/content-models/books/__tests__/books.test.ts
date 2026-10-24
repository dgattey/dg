import {
  buildRichTextDocument,
  cleanWhitespace,
  DEFAULT_SHELVES,
  decodeCoverImageBase64,
  isUsableGoodreadsCoverUrl,
  MAX_COVER_IMAGE_BYTES,
  normalizeContentfulAssetUrl,
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

  it('validates Saga BookServerSyncRequest payloads with upserts, deleteIds, reviewPlainText, notesPlainText, and coverAssetId', () => {
    const sagaPayload = validateBooksSyncPayload({
      deleteIds: ['DEL-1', 'DEL-1'],
      upserts: [
        {
          author: '  Frank   Herbert ',
          coverAssetId: 'ASSET-99',
          coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
          id: 'BOOK-1',
          isbn: 9780441172719,
          notesPlainText: 'Private thought on spice ecology.',
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
            notesPlainText: 'Private thought on spice ecology.',
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

  it('validates coverImageBase64 + coverImageContentType, 3 MiB limit, data: prefix rejection, and URL normalization', () => {
    const sampleBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const validB64 = Buffer.from(sampleBytes).toString('base64');

    const decoded = decodeCoverImageBase64(validB64);
    expect(decoded).toEqual({ bytes: sampleBytes, ok: true });

    expect(
      validateBookMutationInput({
        coverImageBase64: validB64,
        coverImageContentType: 'image/jpeg',
        id: 'BOOK-1',
        title: 'Dune',
      }),
    ).toEqual({
      book: {
        coverImageBase64: validB64,
        coverImageContentType: 'image/jpeg',
        id: 'BOOK-1',
        title: 'Dune',
      },
      ok: true,
    });

    expect(
      validateBookMutationInput({
        coverImageBase64: validB64,
        coverImageContentType: 'image/png',
        title: 'Dune',
      }).ok,
    ).toBe(true);

    const dataUriResult = validateBookMutationInput({
      coverImageBase64: `data:image/jpeg;base64,${validB64}`,
      coverImageContentType: 'image/jpeg',
      title: 'Dune',
    });
    expect(dataUriResult.ok).toBe(false);
    if (!dataUriResult.ok) {
      expect(dataUriResult.error).toContain('data: URI prefix');
    }

    expect(decodeCoverImageBase64(`${validB64.slice(0, 4)}\n${validB64.slice(4)}`).ok).toBe(false);
    expect(decodeCoverImageBase64('not-valid-base64!!!').ok).toBe(false);

    const badTypeResult = validateBookMutationInput({
      coverImageBase64: validB64,
      coverImageContentType: 'image/webp' as 'image/jpeg',
      title: 'Dune',
    });
    expect(badTypeResult.ok).toBe(false);
    if (!badTypeResult.ok) {
      expect(badTypeResult.error).toContain('image/jpeg');
    }

    expect(
      validateBookMutationInput({
        coverImageBase64: validB64,
        title: 'Dune',
      }),
    ).toEqual({
      error: 'Book coverImageBase64 and coverImageContentType must both be provided together',
      ok: false,
    });
    expect(
      validateBookMutationInput({
        coverImageContentType: 'image/jpeg',
        title: 'Dune',
      }),
    ).toEqual({
      error: 'Book coverImageBase64 and coverImageContentType must both be provided together',
      ok: false,
    });

    const exactMaxB64 = Buffer.alloc(MAX_COVER_IMAGE_BYTES, 0x41).toString('base64');
    expect(decodeCoverImageBase64(exactMaxB64).ok).toBe(true);
    const overLimitB64 = Buffer.alloc(MAX_COVER_IMAGE_BYTES + 1, 0x41).toString('base64');
    const overLimitResult = validateBookMutationInput({
      coverImageBase64: overLimitB64,
      coverImageContentType: 'image/jpeg',
      title: 'Dune',
    });
    expect(overLimitResult).toEqual({
      error: `Book coverImageBase64 exceeds maximum decoded size of ${MAX_COVER_IMAGE_BYTES} bytes (3 MiB)`,
      ok: false,
    });

    expect(normalizeContentfulAssetUrl('//images.ctfassets.net/sp/cov-1/book.jpg')).toBe(
      'https://images.ctfassets.net/sp/cov-1/book.jpg',
    );
    expect(normalizeContentfulAssetUrl('https://images.ctfassets.net/sp/cov-1/book.jpg')).toBe(
      'https://images.ctfassets.net/sp/cov-1/book.jpg',
    );
    expect(normalizeContentfulAssetUrl('http://images.ctfassets.net/sp/cov-1/book.jpg')).toBeNull();
    expect(normalizeContentfulAssetUrl('')).toBeNull();
  });
});

describe('goodreadsRss & contentfulBook', () => {
  it('parses Goodreads RSS XML, merges shelves, and computes Contentful diffs', () => {
    const xml = `<rss><channel><item>
      <book_id>42</book_id><title><![CDATA[Dune (Dune, #1)]]></title><author_name>Frank Herbert</author_name>
      <isbn>0441172717</isbn><user_rating>5</user_rating>
      <user_read_at>2025/03/10</user_read_at><user_date_started>2025/03/01</user_date_started>
      <user_review><![CDATA[Masterpiece.]]></user_review>
      <book_large_image_url>https://i.gr-assets.com/images/42._SX98_.jpg</book_large_image_url>
    </item></channel></rss>`;
    const parsed = parseGoodreadsRssXml(xml, 'read');
    const firstItem = parsed[0];
    if (!firstItem) throw new Error('expected parsed item');
    expect(firstItem.title).toBe('Dune');
    expect(firstItem.goodreadsCoverUrl).toBe('https://i.gr-assets.com/images/42.jpg');
    expect(firstItem.isbn).toBe(9780441172719);
    expect(mergeShelfBooks([{ ...firstItem, status: 'reading' }, firstItem])[0]?.status).toBe(
      'read',
    );
    expect(buildGoodreadsRssUrl({ rssKey: 'k', shelf: 'read', userId: 'u1' })).toContain(
      'review/list_rss/u1?per_page=200&shelf=read&key=k',
    );

    const existingNotesDoc = buildRichTextDocument('Keep these private notes intact.');
    const entry: NormalizedContentfulBookEntry = normalizeContentfulBookEntry({
      fields: {
        author: { 'en-US': 'Frank Herbert' },
        coverImage: { 'en-US': { sys: { id: 'cov-1' } } },
        isbn: { 'en-US': 9780441172719 },
        notes: { 'en-US': existingNotesDoc },
        rating: { 'en-US': 4 },
        title: { 'en-US': 'Dune' },
      },
      sys: { id: 'B1', publishedVersion: 2, version: 3 },
    });
    expect(entry.notesText).toBe('Keep these private notes intact.');
    expect(findMatchingContentfulEntry(firstItem, [entry])?.id).toBe('B1');
    const diff = computeBookDiff(firstItem, entry);
    expect(diff.action).toBe('update');
    expect(diff.changedFields).toEqual([
      'rating',
      'reviewDescription',
      'readDateFinished',
      'readDateStarted',
    ]);
    expect(diff.merged.notes).toEqual(existingNotesDoc);
    expect(diff.merged.notesText).toBe('Keep these private notes intact.');
    const cmaFields = buildCmaBookFields(diff.merged);
    expect(cmaFields.rating).toEqual({ 'en-US': 5 });
    expect(cmaFields.notes).toEqual({ 'en-US': existingNotesDoc });
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
