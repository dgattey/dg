import { isRecord } from '@dg/shared-core/types/typeguards';
import {
  cleanWhitespace,
  DEFAULT_LOCALE,
  extractPlainTextFromRichText,
  isBackfilledBookReadDate,
  isDuplicateTitle,
  normalizeAuthor,
  parseIsbn13Number,
} from './bookDomain';
import type { GoodreadsBookItem } from './goodreadsRss';

export type NormalizedContentfulBookEntry = {
  author: string;
  coverImageId: string | null;
  id: string;
  isPublished: boolean;
  isbn: number | null;
  notes: unknown;
  notesText: string | null;
  publishedVersion: number | null;
  rating: number | null;
  rawFields: Record<string, unknown>;
  readDateFinished: string | null;
  readDateStarted: string | null;
  reviewDescription: unknown;
  reviewText: string | null;
  title: string;
  version: number;
};

export type MergedBookFields = {
  author: string;
  coverImageId: string | null;
  isbn: number | null;
  notes: unknown;
  notesText: string | null;
  rating: number | null;
  readDateFinished: string | null;
  readDateStarted: string | null;
  reviewDescription: unknown;
  reviewText: string | null;
  title: string;
};

type BookDiffResult = {
  action: 'create' | 'skip' | 'update';
  changedFields: Array<string>;
  merged: MergedBookFields;
};

const unwrapField = (fieldValue: unknown, locale = DEFAULT_LOCALE): unknown =>
  fieldValue === null || fieldValue === undefined
    ? null
    : isRecord(fieldValue) && Object.hasOwn(fieldValue, locale)
      ? (fieldValue[locale] ?? null)
      : fieldValue;

export function normalizeContentfulBookEntry(
  entry: {
    fields?: Record<string, unknown>;
    sys?: { id?: string; publishedVersion?: number; version?: number };
  },
  locale = DEFAULT_LOCALE,
): NormalizedContentfulBookEntry {
  const fields = entry.fields ?? {};
  const getStr = (key: string): string | null => {
    const val = unwrapField(fields[key], locale);
    return typeof val === 'string' ? val : null;
  };
  const rawIsbn = unwrapField(fields.isbn, locale);
  const rawRating = unwrapField(fields.rating, locale);
  const rawCover = unwrapField(fields.coverImage, locale);
  const reviewDescription = unwrapField(fields.reviewDescription, locale);
  const notes = unwrapField(fields.notes, locale);

  return {
    author: cleanWhitespace(getStr('author') ?? ''),
    coverImageId:
      isRecord(rawCover) && isRecord(rawCover.sys) && typeof rawCover.sys.id === 'string'
        ? rawCover.sys.id
        : null,
    id: entry.sys?.id ?? '',
    isbn:
      typeof rawIsbn === 'number' || typeof rawIsbn === 'string'
        ? parseIsbn13Number(rawIsbn)
        : null,
    isPublished:
      typeof entry.sys?.publishedVersion === 'number' &&
      entry.sys.version === entry.sys.publishedVersion + 1,
    notes,
    notesText: extractPlainTextFromRichText(notes) || null,
    publishedVersion: entry.sys?.publishedVersion ?? null,
    rating: typeof rawRating === 'number' && rawRating > 0 ? rawRating : null,
    rawFields: fields,
    readDateFinished: getStr('readDateFinished'),
    readDateStarted: getStr('readDateStarted'),
    reviewDescription,
    reviewText: extractPlainTextFromRichText(reviewDescription) || null,
    title: cleanWhitespace(getStr('title') ?? ''),
    version: entry.sys?.version ?? 1,
  };
}

const prioritizePublishedEntries = (
  entries: ReadonlyArray<NormalizedContentfulBookEntry>,
): Array<NormalizedContentfulBookEntry> =>
  [...entries].sort(
    (a, b) =>
      Number(b.isPublished) - Number(a.isPublished) ||
      Number(b.isbn !== null) - Number(a.isbn !== null),
  );

export function findMatchingContentfulEntry(
  book: { author?: string | null; id?: string | null; isbn?: number | null; title: string },
  existingEntries: ReadonlyArray<NormalizedContentfulBookEntry>,
): NormalizedContentfulBookEntry | null {
  const prioritized = prioritizePublishedEntries(existingEntries);
  if (book.id) {
    const byId = prioritized.find((e) => e.id === book.id);
    if (byId) return byId;
  }
  if (book.isbn) {
    const byIsbn = prioritized.find((e) => e.isbn !== null && e.isbn === book.isbn);
    if (byIsbn) return byIsbn;
  }
  const targetAuthor = normalizeAuthor(book.author);
  return targetAuthor
    ? (prioritized.find(
        (e) => normalizeAuthor(e.author) === targetAuthor && isDuplicateTitle(book.title, e.title),
      ) ?? null)
    : null;
}

export function findDuplicateContentfulEntries(
  book: { author?: string | null; isbn?: number | null; title: string },
  canonicalId: string,
  existingEntries: ReadonlyArray<NormalizedContentfulBookEntry>,
): Array<NormalizedContentfulBookEntry> {
  const targetAuthor = normalizeAuthor(book.author);
  return existingEntries.filter(
    (e) =>
      e.id !== canonicalId &&
      ((book.isbn && e.isbn !== null && e.isbn === book.isbn) ||
        (Boolean(targetAuthor) &&
          normalizeAuthor(e.author) === targetAuthor &&
          isDuplicateTitle(book.title, e.title))),
  );
}

const CREATE_FIELDS = [
  'title',
  'author',
  'isbn',
  'rating',
  'readDateStarted',
  'readDateFinished',
  'reviewDescription',
];

export function computeBookDiff(
  gr: GoodreadsBookItem,
  ex: NormalizedContentfulBookEntry | null,
): BookDiffResult {
  if (!ex) {
    return {
      action: 'create',
      changedFields: [...CREATE_FIELDS],
      merged: {
        author: gr.author,
        coverImageId: null,
        isbn: gr.isbn ?? null,
        notes: null,
        notesText: null,
        rating: gr.rating ?? null,
        readDateFinished: gr.readDateFinished ?? null,
        readDateStarted: gr.readDateStarted ?? null,
        reviewDescription: gr.reviewDescription ?? null,
        reviewText: gr.reviewText ?? null,
        title: gr.title,
      },
    };
  }
  const title = gr.title || ex.title;
  const author = ex.author || gr.author;
  const isbn = ex.isbn ?? gr.isbn ?? null;
  const reviewUpdated = Boolean(gr.reviewText) && gr.reviewText !== ex.reviewText;
  const backfilledDates = isBackfilledBookReadDate(ex);
  const exFinished = backfilledDates ? null : ex.readDateFinished;
  const exStarted = backfilledDates ? null : ex.readDateStarted;

  const readDateFinished = gr.readDateFinished
    ? !exFinished || exFinished.slice(0, 10) !== gr.readDateFinished.slice(0, 10)
      ? gr.readDateFinished
      : exFinished
    : exFinished;
  const readDateStarted = gr.readDateStarted
    ? (exStarted ?? gr.readDateStarted)
    : gr.readDateFinished && exStarted?.slice(0, 10) === gr.readDateFinished.slice(0, 10)
      ? null
      : exStarted;

  const changedFields = [
    title !== ex.title && 'title',
    author !== ex.author && 'author',
    isbn !== ex.isbn && 'isbn',
    Boolean(gr.rating && gr.rating !== ex.rating) && 'rating',
    reviewUpdated && 'reviewDescription',
    (readDateFinished ?? null) !== (ex.readDateFinished ?? null) && 'readDateFinished',
    (readDateStarted ?? null) !== (ex.readDateStarted ?? null) && 'readDateStarted',
    !ex.coverImageId && 'coverImage',
  ].filter((field): field is string => Boolean(field));

  return {
    action: changedFields.length > 0 || !ex.isPublished ? 'update' : 'skip',
    changedFields,
    merged: {
      author,
      coverImageId: ex.coverImageId,
      isbn,
      notes: ex.notes,
      notesText: ex.notesText,
      rating: gr.rating ?? ex.rating ?? null,
      readDateFinished,
      readDateStarted,
      reviewDescription: reviewUpdated ? gr.reviewDescription : ex.reviewDescription,
      reviewText: reviewUpdated ? gr.reviewText : ex.reviewText,
      title,
    },
  };
}

const CLEARABLE_CMA_BOOK_KEYS = new Set([
  'isbn',
  'notes',
  'rating',
  'readDateFinished',
  'readDateStarted',
  'reviewDescription',
]);

export function buildCmaBookFields(
  merged: MergedBookFields,
  locale = DEFAULT_LOCALE,
): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = { title: { [locale]: merged.title } };
  if (merged.author) fields.author = { [locale]: merged.author };
  if (typeof merged.isbn === 'number' && Number.isFinite(merged.isbn))
    fields.isbn = { [locale]: merged.isbn };
  if (typeof merged.rating === 'number' && merged.rating > 0)
    fields.rating = { [locale]: merged.rating };
  if (merged.readDateStarted) fields.readDateStarted = { [locale]: merged.readDateStarted };
  if (merged.readDateFinished) fields.readDateFinished = { [locale]: merged.readDateFinished };
  if (merged.coverImageId) {
    fields.coverImage = {
      [locale]: { sys: { id: merged.coverImageId, linkType: 'Asset', type: 'Link' } },
    };
  }
  if (merged.reviewDescription) fields.reviewDescription = { [locale]: merged.reviewDescription };
  if (merged.notes) fields.notes = { [locale]: merged.notes };
  return fields;
}

export function mergeCmaBookFields(
  rawFields: Record<string, unknown> | null | undefined,
  merged: MergedBookFields,
  locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  const nextFields = buildCmaBookFields(merged, locale);
  const preserved = rawFields
    ? Object.fromEntries(
        Object.entries(rawFields).filter(
          ([key]) => !CLEARABLE_CMA_BOOK_KEYS.has(key) || Object.hasOwn(nextFields, key),
        ),
      )
    : {};
  return { ...preserved, ...nextFields };
}
