import 'server-only';

import {
  buildRichTextDocument,
  cleanWhitespace,
  DEFAULT_SHELVES,
  decodeCoverImageBase64,
  isUsableGoodreadsCoverUrl,
  normalizeReviewText,
  type ReadingStatus,
  upgradeGoodreadsCoverUrl,
} from '@dg/content-models/books/bookDomain';
import {
  type BookMutationInput,
  validateBookMutationInput,
} from '@dg/content-models/books/bookSchema';
import {
  buildCmaBookFields,
  computeBookDiff,
  findDuplicateContentfulEntries,
  findMatchingContentfulEntry,
  type MergedBookFields,
  mergeCmaBookFields,
  type NormalizedContentfulBookEntry,
} from '@dg/content-models/books/contentfulBook';
import {
  buildGoodreadsRssUrl,
  type GoodreadsBookItem,
  mergeShelfBooks,
  parseGoodreadsRssXml,
} from '@dg/content-models/books/goodreadsRss';
import { ContentfulCmaClient } from './contentfulCmaClient';

export type BookMutationOutcome = Omit<
  NormalizedContentfulBookEntry,
  'isPublished' | 'notes' | 'publishedVersion' | 'rawFields' | 'reviewDescription'
> & {
  action: 'created' | 'deleted' | 'skipped' | 'updated';
  coverAssetId: string | null;
  coverImageUrl: string | null;
};

type GoodreadsSyncBookError = { author: string; message: string; title: string };

export type GoodreadsSyncSummary = {
  created: number;
  createdCount: number;
  durationMs: number;
  errors: Array<GoodreadsSyncBookError>;
  goodreadsItemsFetched: number;
  ok: boolean;
  revalidated: boolean;
  scanned: number;
  skippedCount: number;
  unchanged: number;
  updated: number;
  updatedCount: number;
};

export function resolveCoverUrl(book: {
  coverImageUrl?: string | null;
  goodreadsCoverUrl?: string | null;
  isbn?: number | null;
}): string | null {
  const upgraded = upgradeGoodreadsCoverUrl(book.coverImageUrl ?? book.goodreadsCoverUrl);
  if (upgraded) return upgraded;
  if (book.coverImageUrl && isUsableGoodreadsCoverUrl(book.coverImageUrl)) {
    return book.coverImageUrl.trim();
  }
  return book.isbn
    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(String(book.isbn))}-L.jpg?default=false`
    : null;
}

const pick = <T>(raw: unknown, val: T | null | undefined, ex: T | null | undefined): T | null =>
  raw !== undefined ? (val ?? null) : (ex ?? null);

const toOutcome = (
  action: BookMutationOutcome['action'],
  {
    isPublished: _i,
    notes: _n,
    publishedVersion: _p,
    rawFields: _r,
    reviewDescription: _d,
    ...rest
  }: NormalizedContentfulBookEntry,
  coverImageUrl: string | null,
): BookMutationOutcome => ({
  action,
  coverAssetId: rest.coverImageId,
  coverImageUrl,
  ...rest,
});

export async function upsertBookToContentful(
  cma: ContentfulCmaClient,
  input: BookMutationInput,
): Promise<BookMutationOutcome> {
  const validated = validateBookMutationInput(input);
  if (!validated.ok) throw new Error(validated.error);
  const b = validated.book;
  const author = b.author ?? '';
  const query = { author, id: b.id, isbn: b.isbn, title: b.title };
  const ex =
    (b.id ? await cma.fetchBookById(b.id) : null) ??
    findMatchingContentfulEntry(query, await cma.fetchAllBooks());
  const newId = b.id ? cleanWhitespace(b.id).toUpperCase() : undefined;
  const targetBookId = ex?.id ?? newId;
  const isbn = b.isbn ?? ex?.isbn ?? null;
  const reviewDescription =
    b.reviewPlainText !== undefined
      ? buildRichTextDocument(b.reviewPlainText)
      : (ex?.reviewDescription ?? null);
  const reviewText =
    b.reviewPlainText !== undefined
      ? normalizeReviewText(b.reviewPlainText) || null
      : (ex?.reviewText ?? null);
  const notes =
    b.notesPlainText !== undefined ? buildRichTextDocument(b.notesPlainText) : (ex?.notes ?? null);
  const notesText =
    b.notesPlainText !== undefined
      ? normalizeReviewText(b.notesPlainText) || null
      : (ex?.notesText ?? null);

  let coverImageId = b.coverAssetId ?? ex?.coverImageId ?? null;
  let coverImageUrl: string | null = null;

  if (b.coverImageBase64 && b.coverImageContentType) {
    const decoded = decodeCoverImageBase64(b.coverImageBase64);
    if (!decoded.ok) throw new Error(decoded.error);
    const uploaded = await cma.createAndPublishBinaryCoverAsset({
      bytes: decoded.bytes,
      contentType: b.coverImageContentType,
      fileNameBase: targetBookId,
      title: b.title,
    });
    coverImageId = uploaded.assetId;
    coverImageUrl = uploaded.url;
  } else {
    const candidateCoverUrl = resolveCoverUrl({ coverImageUrl: b.coverImageUrl, isbn });
    if (b.coverImageUrl || (!coverImageId && candidateCoverUrl)) {
      const uploaded = candidateCoverUrl
        ? await cma
            .createAndPublishCoverAsset({ imageUrl: candidateCoverUrl, title: b.title })
            .catch(() => null)
        : null;
      if (uploaded) {
        coverImageId = uploaded.assetId;
        coverImageUrl = uploaded.url;
      }
    }
  }

  if (coverImageId && !coverImageUrl) {
    coverImageUrl = await cma.fetchAssetUrl(coverImageId).catch(() => null);
  }

  const readDateFinished = pick(b.readDateFinished, b.readDateFinished, ex?.readDateFinished);
  const readDateStarted = pick(b.readDateStarted, b.readDateStarted, ex?.readDateStarted);
  const readingStatus: ReadingStatus =
    b.readingStatus ??
    (readDateFinished
      ? 'read'
      : readDateStarted
        ? 'reading'
        : b.readDateFinished === null && b.readDateStarted === null
          ? 'notStarted'
          : (ex?.readingStatus ?? 'notStarted'));

  const merged: MergedBookFields = {
    author: author || ex?.author || '',
    coverImageId,
    isbn,
    notes,
    notesText,
    rating: pick(b.rating, b.rating, ex?.rating),
    readDateFinished,
    readDateStarted,
    readingStatus,
    reviewDescription,
    reviewText,
    title: b.title,
  };

  const fields = mergeCmaBookFields(ex?.rawFields, merged, cma.locale);
  if (ex) {
    return toOutcome(
      'updated',
      await cma.updateAndPublishBook(ex.id, ex.version, fields),
      coverImageUrl,
    );
  }
  return toOutcome('created', await cma.createAndPublishBook(fields, newId), coverImageUrl);
}

async function fetchGoodreadsShelfItems(opts: {
  fetchImpl?: typeof fetch;
  rssKey?: string | null;
  shelves?: ReadonlyArray<string>;
  userId: string;
}): Promise<Array<GoodreadsBookItem>> {
  const { fetchImpl = fetch, rssKey, shelves = DEFAULT_SHELVES, userId } = opts;
  const headers = {
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    'User-Agent': 'Saga-Goodreads-Sync/1.0',
  };
  const results = await Promise.all(
    shelves.map(async (shelf) => {
      const res = await fetchImpl(buildGoodreadsRssUrl({ rssKey, shelf, userId }), { headers });
      if (!res.ok)
        throw new Error(`Goodreads RSS fetch failed for shelf "${shelf}" (${res.status})`);
      return parseGoodreadsRssXml(await res.text(), shelf);
    }),
  );
  return mergeShelfBooks(results.flat());
}

export async function runGoodreadsSync(opts: {
  contentfulEnvironmentId?: string;
  contentfulManagementToken: string;
  contentfulSpaceId: string;
  fetchImpl?: typeof fetch;
  goodreadsRssKey?: string | null;
  goodreadsUserId: string;
  shelves?: ReadonlyArray<string>;
}): Promise<GoodreadsSyncSummary> {
  const startedAt = Date.now();
  const { fetchImpl = fetch, shelves = DEFAULT_SHELVES } = opts;
  const cma = new ContentfulCmaClient({
    environmentId: opts.contentfulEnvironmentId,
    fetchImpl,
    managementToken: opts.contentfulManagementToken,
    spaceId: opts.contentfulSpaceId,
  });
  const [grBooks, existing] = await Promise.all([
    fetchGoodreadsShelfItems({
      fetchImpl,
      rssKey: opts.goodreadsRssKey,
      shelves,
      userId: opts.goodreadsUserId,
    }),
    cma.fetchAllBooks(),
  ]);
  const applicable = grBooks.filter(
    (b) => b.status !== 'notStarted' || findMatchingContentfulEntry(b, existing) !== null,
  );
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors: Array<GoodreadsSyncBookError> = [];

  for (const b of applicable) {
    try {
      const ex = findMatchingContentfulEntry(b, existing);
      const diff = computeBookDiff(b, ex);
      if (diff.action === 'skip') {
        skippedCount += 1;
        continue;
      }
      const m: MergedBookFields = { ...diff.merged };
      if (!m.coverImageId) {
        const coverUrl = resolveCoverUrl(b);
        if (coverUrl) {
          const uploaded = await cma
            .createAndPublishCoverAsset({ imageUrl: coverUrl, title: m.title })
            .catch(() => null);
          m.coverImageId = uploaded?.assetId ?? null;
        }
      }
      if (diff.action === 'create') {
        existing.push(await cma.createAndPublishBook(buildCmaBookFields(m)));
        createdCount += 1;
      } else if (diff.action === 'update' && ex) {
        for (const dup of findDuplicateContentfulEntries(b, ex.id, existing)) {
          await cma.unpublishAndDeleteBook(dup.id).catch(() => false);
        }
        const mergedFields = mergeCmaBookFields(ex.rawFields, m, cma.locale);
        await cma.updateAndPublishBook(ex.id, ex.version, mergedFields);
        updatedCount += 1;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ author: b.author, message, title: b.title });
    }
  }

  return {
    created: createdCount,
    createdCount,
    durationMs: Date.now() - startedAt,
    errors,
    goodreadsItemsFetched: grBooks.length,
    ok: errors.length === 0,
    revalidated: createdCount > 0 || updatedCount > 0,
    scanned: grBooks.length,
    skippedCount,
    unchanged: skippedCount,
    updated: updatedCount,
    updatedCount,
  };
}
