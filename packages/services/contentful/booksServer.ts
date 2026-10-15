import 'server-only';

import crypto from 'node:crypto';

export const DEFAULT_SHELVES = ['currently-reading', 'read'] as const;
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_ENVIRONMENT_ID = 'master';
export const CONTENTFUL_CMA_BASE_URL = 'https://api.contentful.com';
export const CONTENTFUL_UPLOAD_BASE_URL = 'https://upload.contentful.com';
export const BOOKCOVER_API_BASE_URL = 'https://bookcover.longitood.com/bookcover';
export const OPENLIBRARY_API_BASE_URL = 'https://openlibrary.org';
export const OPENLIBRARY_COVERS_BASE_URL = 'https://covers.openlibrary.org';

const MIN_COVER_BYTES = 10_000;
const OPENLIBRARY_PREFER_BOOKCOVER_BELOW_BYTES = 80_000;
const BOOKCOVER_PREFERRED_MIN_BYTES = 30_000;
const BOOKCOVER_PREFERRED_RATIO = 0.85;
const OPENLIBRARY_PREFERRED_COVER_BYTES = 40_000;
const MAX_OPENLIBRARY_SEARCH_CANDIDATES = 4;

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  hellip: '\u2026',
  ldquo: '\u201C',
  lsquo: '\u2018',
  lt: '<',
  mdash: '\u2014',
  nbsp: ' ',
  ndash: '\u2013',
  quot: '"',
  rdquo: '\u201D',
  rsquo: '\u2019',
};

export type ReadingStatus = 'notStarted' | 'read' | 'reading';

export type RichTextTextNode = {
  data: Record<string, never>;
  marks: Array<never>;
  nodeType: 'text';
  value: string;
};

export type RichTextParagraphNode = {
  content: Array<RichTextTextNode>;
  data: Record<string, never>;
  nodeType: 'paragraph';
};

export type RichTextDocument = {
  content: Array<RichTextParagraphNode>;
  data: Record<string, never>;
  nodeType: 'document';
};

export type GoodreadsBookItem = {
  author: string;
  bookId: string | null;
  bookPublished: string | null;
  goodreadsCoverUrl: string | null;
  isbn: number | null;
  numPages: number | null;
  rating: number | null;
  readDateFinished: string | null;
  readDateStarted: string | null;
  reviewDescription: RichTextDocument | null;
  reviewText: string | null;
  shelf: string;
  status: ReadingStatus;
  title: string;
  userShelves: string;
};

export type NormalizedContentfulBookEntry = {
  author: string;
  coverImageId: string | null;
  id: string;
  isPublished: boolean;
  isbn: number | null;
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
  rating: number | null;
  readDateFinished: string | null;
  readDateStarted: string | null;
  reviewDescription: unknown;
  reviewText: string | null;
  title: string;
};

export type BookDiffResult = {
  action: 'create' | 'skip' | 'update';
  changedFields: Array<string>;
  merged: MergedBookFields;
};

export type GoodreadsSyncBookChange = {
  author: string;
  changedFields: Array<string>;
  id?: string;
  status: ReadingStatus;
  title: string;
};

export type GoodreadsSyncBookError = {
  author: string;
  message: string;
  title: string;
};

export type GoodreadsSyncSummary = {
  applicableBooksCount: number;
  created: Array<GoodreadsSyncBookChange>;
  createdCount: number;
  dryRun: boolean;
  durationMs: number;
  errors: Array<GoodreadsSyncBookError>;
  existingContentfulBooksCount: number;
  goodreadsItemsFetched: number;
  ok: boolean;
  shelvesPolled: ReadonlyArray<string>;
  skippedCount: number;
  updated: Array<GoodreadsSyncBookChange>;
  updatedCount: number;
};

export type BookMutationInput = {
  author?: string | null;
  coverImageId?: string | null;
  coverImageUrl?: string | null;
  id?: string | null;
  isbn?: number | string | null;
  rating?: number | null;
  readDateFinished?: string | null;
  readDateStarted?: string | null;
  reviewDescription?: unknown;
  reviewText?: string | null;
  title: string;
};

export type BookMutationOutcome = {
  action: 'created' | 'deleted' | 'skipped' | 'updated';
  author: string;
  coverImageId: string | null;
  id: string;
  isbn: number | null;
  rating: number | null;
  readDateFinished: string | null;
  readDateStarted: string | null;
  reviewText: string | null;
  title: string;
  version: number;
};

export type FetchLike = typeof fetch;

type CoverImageCandidate = {
  bytes: number;
  url: string;
};

type OpenLibraryEditionDoc = {
  isbn?: Array<string>;
  title?: string;
};

type OpenLibrarySearchDoc = {
  author_name?: Array<string>;
  cover_edition_key?: string;
  cover_i?: number;
  editions?: {
    docs?: Array<OpenLibraryEditionDoc>;
  };
  key?: string;
  language?: Array<string>;
  title?: string;
};

/**
 * Decodes XML/HTML character entities (`&amp;`, `&#39;`, `&#x2019;`, etc.).
 */
export function decodeXmlEntities(input: string | null | undefined): string {
  if (!input) {
    return '';
  }
  return String(input).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
    }
    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
    }
    const lower = entity.toLowerCase();
    return Object.hasOwn(NAMED_HTML_ENTITIES, lower) ? (NAMED_HTML_ENTITIES[lower] ?? full) : full;
  });
}

/**
 * Matches `String.cleanedWhitespace` in `Saga/Saga/Shared/Extensions/String.swift`:
 * collapses all whitespace runs to single spaces and trims leading/trailing whitespace.
 */
export function cleanWhitespace(input: string | null | undefined): string {
  if (!input) {
    return '';
  }
  return String(input).replace(/\s+/g, ' ').trim();
}

export function normalizeAuthor(author: string | null | undefined): string {
  return cleanWhitespace(author).toLowerCase();
}

export function normalizeTitle(title: string | null | undefined): string {
  return cleanWhitespace(title).toLowerCase();
}

/**
 * Matches `GoodreadsCSVParser.isDuplicateTitle(_:_:)`:
 * case-insensitive substring containment in either direction.
 */
export function isDuplicateTitle(
  titleA: string | null | undefined,
  titleB: string | null | undefined,
): boolean {
  const a = normalizeTitle(titleA);
  const b = normalizeTitle(titleB);
  if (!a || !b) {
    return false;
  }
  return a.includes(b) || b.includes(a);
}

/**
 * Computes ISBN-13 check digit for a 12-digit prefix (matching `GoodreadsCSVParser.isbn13CheckDigit`).
 */
export function isbn13CheckDigit(twelveDigits: string): string | null {
  if (!/^\d{12}$/.test(twelveDigits)) {
    return null;
  }
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = Number.parseInt(twelveDigits[i] ?? '0', 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
}

/**
 * Converts a raw ISBN-10 or ISBN-13 string into a numeric 13-digit ISBN integer,
 * matching `GoodreadsCSVParser.isbn13(from:)` and `isbnNumber(from:)`.
 */
export function parseIsbn13Number(raw: number | string | null | undefined): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'number') {
    return Number.isSafeInteger(raw) && raw > 0 && String(raw).length === 13 ? raw : null;
  }
  const normalized = String(raw)
    .replace(/="/g, '')
    .replace(/"/g, '')
    .replace(/-/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();

  if (!normalized) {
    return null;
  }

  if (/^\d{13}$/.test(normalized)) {
    const num = Number.parseInt(normalized, 10);
    return Number.isSafeInteger(num) && num > 0 ? num : null;
  }

  if (normalized.length === 10 && /^\d{9}[\dX]$/.test(normalized)) {
    const prefix = normalized.slice(0, 9);
    const base = `978${prefix}`;
    const check = isbn13CheckDigit(base);
    if (!check) {
      return null;
    }
    const num = Number.parseInt(`${base}${check}`, 10);
    return Number.isSafeInteger(num) && num > 0 ? num : null;
  }

  return null;
}

/**
 * Cleans HTML markup from Goodreads `<user_review>` into plain text with newline-separated
 * paragraphs, matching `RichTextDocument(fromPlainText:)` in `RichTextDocumentTransformer.swift`.
 */
export function normalizeReviewText(rawReview: string | null | undefined): string {
  if (!rawReview) {
    return '';
  }
  const withLineBreaks = String(rawReview)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const decoded = decodeXmlEntities(withLineBreaks);
  const paragraphs = decoded.split('\n').filter((line) => line.length > 0);
  return paragraphs.join('\n\n');
}

/**
 * Converts a review string into a Contentful `RichTextDocument` JSON structure matching
 * `RichTextDocument(fromPlainText:)` in `RichTextDocumentTransformer.swift`.
 */
export function buildRichTextDocument(
  rawReview: string | null | undefined,
): RichTextDocument | null {
  if (!rawReview) {
    return null;
  }
  const withLineBreaks = String(rawReview)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const decoded = decodeXmlEntities(withLineBreaks);
  const paragraphs = decoded.split('\n').filter((line) => line.length > 0);

  if (paragraphs.length === 0) {
    return null;
  }

  return {
    content: paragraphs.map((line) => ({
      content: [
        {
          data: {},
          marks: [],
          nodeType: 'text',
          value: line,
        },
      ],
      data: {},
      nodeType: 'paragraph',
    })),
    data: {},
    nodeType: 'document',
  };
}

/**
 * Extracts plain text from an existing Contentful `RichTextDocument` JSON object,
 * matching `RichTextDocument.plainText` in `RichTextRenderer.swift`.
 */
export function extractPlainTextFromRichText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') {
    return '';
  }
  const record = doc as { content?: unknown };
  if (!Array.isArray(record.content)) {
    return '';
  }

  const walkNode = (node: unknown): string => {
    if (!node || typeof node !== 'object') {
      return '';
    }
    const candidate = node as { content?: unknown; nodeType?: unknown; value?: unknown };
    if (candidate.nodeType === 'text' && typeof candidate.value === 'string') {
      return candidate.value;
    }
    if (Array.isArray(candidate.content)) {
      return candidate.content.map(walkNode).join('');
    }
    return '';
  };

  const parts: Array<string> = [];
  for (const node of record.content) {
    const text = walkNode(node).trim();
    if (text) {
      parts.push(text);
    }
  }
  return parts.join('\n\n');
}

/**
 * Parses a Goodreads RSS date string (RFC 822 / RFC 2822, ISO 8601, or `YYYY/MM/DD`)
 * into a canonical ISO-8601 UTC timestamp string (`YYYY-MM-DDTHH:mm:ssZ`).
 */
export function parseGoodreadsDate(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const trimmed = String(raw).trim();
  if (!trimmed) {
    return null;
  }

  const slashMatch = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slashMatch) {
    const [, year, month, day] = slashMatch;
    return `${year}-${month}-${day}T00:00:00Z`;
  }

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Compares two date strings by calendar day (YYYY-MM-DD in UTC) or exact timestamp.
 */
export function datesMatch(
  dateA: string | null | undefined,
  dateB: string | null | undefined,
): boolean {
  if (!dateA && !dateB) {
    return true;
  }
  if (!dateA || !dateB) {
    return false;
  }
  const tsA = Date.parse(dateA);
  const tsB = Date.parse(dateB);
  if (Number.isNaN(tsA) || Number.isNaN(tsB)) {
    return String(dateA) === String(dateB);
  }
  const dayA = new Date(tsA).toISOString().slice(0, 10);
  const dayB = new Date(tsB).toISOString().slice(0, 10);
  return dayA === dayB;
}

/**
 * Extracts the text content of a single XML tag from an `<item>` block,
 * unwrapping `<![CDATA[...]]>` if present and decoding XML entities.
 */
export function extractXmlTag(itemXml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = itemXml.match(regex);
  if (!match?.[1]) {
    return null;
  }

  let raw = match[1].trim();
  const cdataMatch = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdataMatch?.[1] !== undefined) {
    raw = cdataMatch[1];
  } else {
    raw = decodeXmlEntities(raw);
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Detects Goodreads placeholder "nophoto" URLs so we don't upload blank placeholder covers.
 */
export function isUsableGoodreadsCoverUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  return !/nophoto/i.test(trimmed);
}

/**
 * Upgrades Goodreads thumbnail/medium cover URLs (e.g. `._SX98_.jpg`, `._SY75_.jpg`)
 * to full-resolution cover URLs when possible.
 */
export function upgradeGoodreadsCoverUrl(url: string | null | undefined): string | null {
  if (!isUsableGoodreadsCoverUrl(url) || !url) {
    return null;
  }
  return url.trim().replace(/\._S[XY]\d+_(?=\.[a-zA-Z]+$)/, '');
}

/**
 * Derives `readDateStarted` and `readDateFinished` from a Goodreads RSS item and shelf,
 * matching `GoodreadsCSVParser.parseRow` and `Book.readingStatus` in Saga.
 */
export function resolveReadDates({
  shelf,
  userDateAdded,
  userDateCreated,
  userDateStarted,
  userReadAt,
  userShelves,
}: {
  shelf: string;
  userDateAdded?: string | null;
  userDateCreated?: string | null;
  userDateStarted?: string | null;
  userReadAt?: string | null;
  userShelves?: string | null;
}): {
  readDateFinished: string | null;
  readDateStarted: string | null;
  status: ReadingStatus;
} {
  const shelvesList = [shelf, ...(userShelves ? userShelves.split(',').map((s) => s.trim()) : [])]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const isCurrentlyReading =
    shelf === 'currently-reading' || shelvesList.includes('currently-reading');
  const isToRead =
    !isCurrentlyReading &&
    (shelf === 'to-read' || (shelvesList.includes('to-read') && !shelvesList.includes('read')));

  const readDateFinishedFromRead = parseGoodreadsDate(userReadAt);
  const readDateFinishedFromAdded =
    parseGoodreadsDate(userDateAdded) ?? parseGoodreadsDate(userDateCreated);
  const readDateStartedFromStarted = parseGoodreadsDate(userDateStarted);

  if (isToRead && !readDateFinishedFromRead) {
    return {
      readDateFinished: null,
      readDateStarted: null,
      status: 'notStarted',
    };
  }

  let readDateStarted = readDateStartedFromStarted ?? readDateFinishedFromAdded;
  let readDateFinished: string | null = null;
  if (readDateFinishedFromRead) {
    readDateFinished = readDateFinishedFromRead;
  } else if (!isCurrentlyReading) {
    readDateFinished = readDateFinishedFromAdded;
  }

  if (readDateFinished && readDateStarted) {
    const finishedTs = Date.parse(readDateFinished);
    const startedTs = Date.parse(readDateStarted);
    if (!Number.isNaN(finishedTs) && !Number.isNaN(startedTs) && finishedTs < startedTs) {
      if (readDateFinishedFromRead !== null) {
        readDateStarted = null;
      } else {
        readDateFinished = null;
      }
    }
  }

  const status: ReadingStatus =
    readDateFinished !== null ? 'read' : readDateStarted !== null ? 'reading' : 'notStarted';

  return {
    readDateFinished,
    readDateStarted,
    status,
  };
}

/**
 * Parses a Goodreads RSS XML feed string into normalized book items.
 */
export function parseGoodreadsRssXml(xml: string, shelf = 'read'): Array<GoodreadsBookItem> {
  if (!xml) {
    return [];
  }

  const items: Array<GoodreadsBookItem> = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match = itemRegex.exec(xml);

  while (match !== null) {
    const itemXml = match[1] ?? '';
    const rawTitle = extractXmlTag(itemXml, 'title');
    const rawAuthor = extractXmlTag(itemXml, 'author_name');
    if (rawTitle && rawAuthor) {
      const title = cleanWhitespace(rawTitle);
      const author = cleanWhitespace(rawAuthor);
      const bookId = extractXmlTag(itemXml, 'book_id');
      const rawIsbn13 = extractXmlTag(itemXml, 'isbn13');
      const rawIsbn10 = extractXmlTag(itemXml, 'isbn');
      const isbn = parseIsbn13Number(rawIsbn13) ?? parseIsbn13Number(rawIsbn10);

      const rawRating = extractXmlTag(itemXml, 'user_rating');
      const parsedRating = rawRating ? Number.parseInt(rawRating, 10) : 0;
      const rating = Number.isInteger(parsedRating) && parsedRating > 0 ? parsedRating : null;

      const userReadAt = extractXmlTag(itemXml, 'user_read_at');
      const userDateStarted = extractXmlTag(itemXml, 'user_date_started');
      const userDateAdded = extractXmlTag(itemXml, 'user_date_added');
      const userDateCreated =
        extractXmlTag(itemXml, 'user_date_created') ?? extractXmlTag(itemXml, 'pubDate');
      const userShelves = extractXmlTag(itemXml, 'user_shelves');
      const rawReview = extractXmlTag(itemXml, 'user_review');
      const reviewText = normalizeReviewText(rawReview);
      const reviewDescription = buildRichTextDocument(rawReview);

      const largeImageUrl =
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_large_image_url')) ??
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_medium_image_url')) ??
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_image_url'));

      const rawNumPages = extractXmlTag(itemXml, 'num_pages');
      const numPages = rawNumPages ? Number.parseInt(rawNumPages, 10) || null : null;
      const bookPublished = extractXmlTag(itemXml, 'book_published');

      const { readDateFinished, readDateStarted, status } = resolveReadDates({
        shelf,
        userDateAdded,
        userDateCreated,
        userDateStarted,
        userReadAt,
        userShelves,
      });

      items.push({
        author,
        bookId,
        bookPublished,
        goodreadsCoverUrl: largeImageUrl,
        isbn,
        numPages,
        rating,
        readDateFinished,
        readDateStarted,
        reviewDescription,
        reviewText: reviewText || null,
        shelf,
        status,
        title,
        userShelves: userShelves ?? shelf,
      });
    }

    match = itemRegex.exec(xml);
  }

  return items;
}

/**
 * Merges books across multiple shelves (`read`, `currently-reading`, `to-read`),
 * prioritizing `read` > `currently-reading` > `to-read` if a book appears in multiple feeds.
 */
export function mergeShelfBooks(
  shelfItemsList: ReadonlyArray<GoodreadsBookItem>,
): Array<GoodreadsBookItem> {
  const priority: Record<ReadingStatus, number> = {
    notStarted: 1,
    read: 3,
    reading: 2,
  };
  const merged: Array<GoodreadsBookItem> = [];

  for (const item of shelfItemsList) {
    const existingIndex = merged.findIndex(
      (candidate) =>
        (item.bookId && candidate.bookId && item.bookId === candidate.bookId) ||
        (item.isbn && candidate.isbn && item.isbn === candidate.isbn) ||
        (normalizeAuthor(item.author) === normalizeAuthor(candidate.author) &&
          isDuplicateTitle(item.title, candidate.title)),
    );

    if (existingIndex === -1) {
      merged.push(item);
      continue;
    }

    const existing = merged[existingIndex];
    if (!existing) {
      continue;
    }
    const existingPriority = priority[existing.status] ?? 0;
    const incomingPriority = priority[item.status] ?? 0;

    if (incomingPriority > existingPriority) {
      merged[existingIndex] = {
        ...existing,
        ...item,
        goodreadsCoverUrl: item.goodreadsCoverUrl ?? existing.goodreadsCoverUrl,
        isbn: item.isbn ?? existing.isbn,
        rating: item.rating ?? existing.rating,
        reviewDescription: item.reviewDescription ?? existing.reviewDescription,
        reviewText: item.reviewText ?? existing.reviewText,
      };
    } else {
      merged[existingIndex] = {
        ...existing,
        goodreadsCoverUrl: existing.goodreadsCoverUrl ?? item.goodreadsCoverUrl,
        isbn: existing.isbn ?? item.isbn,
        rating: existing.rating ?? item.rating,
        reviewDescription: existing.reviewDescription ?? item.reviewDescription,
        reviewText: existing.reviewText ?? item.reviewText,
      };
    }
  }

  return merged;
}

/**
 * Unwraps a localized CMA field (`{ "en-US": value }`) or plain CDA field (`value`).
 */
export function unwrapField<T = unknown>(fieldValue: unknown, locale = DEFAULT_LOCALE): T | null {
  if (fieldValue === null || fieldValue === undefined) {
    return null;
  }
  if (
    typeof fieldValue === 'object' &&
    !Array.isArray(fieldValue) &&
    Object.hasOwn(fieldValue, locale)
  ) {
    return ((fieldValue as Record<string, unknown>)[locale] as T | undefined) ?? null;
  }
  return fieldValue as T;
}

/**
 * Normalizes a Contentful `book` entry (from CMA `/entries`) for fast lookup and diffing.
 */
export function normalizeContentfulBookEntry(
  entry: {
    fields?: Record<string, unknown>;
    sys?: { id?: string; publishedVersion?: number; version?: number };
  },
  locale = DEFAULT_LOCALE,
): NormalizedContentfulBookEntry {
  const fields = entry.fields ?? {};
  const title = cleanWhitespace(unwrapField<string>(fields.title, locale) ?? '');
  const author = cleanWhitespace(unwrapField<string>(fields.author, locale) ?? '');
  const rawIsbn = unwrapField<number | string>(fields.isbn, locale);
  const isbn = typeof rawIsbn === 'number' ? rawIsbn : parseIsbn13Number(rawIsbn);
  const rawRating = unwrapField<number>(fields.rating, locale);
  const rating = typeof rawRating === 'number' && rawRating > 0 ? rawRating : null;
  const readDateStarted = unwrapField<string>(fields.readDateStarted, locale) ?? null;
  const readDateFinished = unwrapField<string>(fields.readDateFinished, locale) ?? null;
  const coverLink = unwrapField<{ sys?: { id?: string } }>(fields.coverImage, locale);
  const coverImageId = coverLink?.sys?.id ?? null;
  const reviewDescription = unwrapField(fields.reviewDescription, locale) ?? null;
  const reviewText = extractPlainTextFromRichText(reviewDescription) || null;

  const isPublished =
    typeof entry.sys?.publishedVersion === 'number' &&
    entry.sys.version === entry.sys.publishedVersion + 1;

  return {
    author,
    coverImageId,
    id: entry.sys?.id ?? '',
    isbn,
    isPublished,
    publishedVersion: entry.sys?.publishedVersion ?? null,
    rating,
    rawFields: fields,
    readDateFinished,
    readDateStarted,
    reviewDescription,
    reviewText,
    title,
    version: entry.sys?.version ?? 1,
  };
}

/**
 * Matches a book item against existing Contentful `book` entries by:
 * 1. Exact entry `id` (if provided)
 * 2. Exact ISBN-13 match
 * 3. Normalized author + case-insensitive title containment (matching `Book.findDuplicate` in Saga)
 */
export function findMatchingContentfulEntry(
  book: { author?: string | null; id?: string | null; isbn?: number | null; title: string },
  existingEntries: ReadonlyArray<NormalizedContentfulBookEntry>,
): NormalizedContentfulBookEntry | null {
  if (book.id) {
    const byId = existingEntries.find((entry) => entry.id === book.id);
    if (byId) {
      return byId;
    }
  }

  if (book.isbn) {
    const byIsbn = existingEntries.find((entry) => entry.isbn !== null && entry.isbn === book.isbn);
    if (byIsbn) {
      return byIsbn;
    }
  }

  const targetAuthor = normalizeAuthor(book.author);
  if (!targetAuthor) {
    return null;
  }

  return (
    existingEntries.find(
      (entry) =>
        normalizeAuthor(entry.author) === targetAuthor && isDuplicateTitle(book.title, entry.title),
    ) ?? null
  );
}

/**
 * Computes whether a Goodreads book introduces any changes compared to an existing
 * Contentful `book` entry, preserving existing non-null fields unless Goodreads has newer data.
 */
export function computeBookDiff(
  goodreadsBook: GoodreadsBookItem,
  existingEntry: NormalizedContentfulBookEntry | null,
): BookDiffResult {
  if (!existingEntry) {
    return {
      action: 'create',
      changedFields: [
        'title',
        'author',
        'isbn',
        'rating',
        'readDateStarted',
        'readDateFinished',
        'reviewDescription',
      ],
      merged: {
        author: goodreadsBook.author,
        coverImageId: null,
        isbn: goodreadsBook.isbn ?? null,
        rating: goodreadsBook.rating ?? null,
        readDateFinished: goodreadsBook.readDateFinished ?? null,
        readDateStarted: goodreadsBook.readDateStarted ?? null,
        reviewDescription: goodreadsBook.reviewDescription ?? null,
        reviewText: goodreadsBook.reviewText ?? null,
        title: goodreadsBook.title,
      },
    };
  }

  const changedFields: Array<string> = [];

  const title = goodreadsBook.title || existingEntry.title;
  if (title !== existingEntry.title) {
    changedFields.push('title');
  }

  const author = existingEntry.author || goodreadsBook.author;
  if (author !== existingEntry.author) {
    changedFields.push('author');
  }

  const isbn = existingEntry.isbn ?? goodreadsBook.isbn ?? null;
  if (isbn !== existingEntry.isbn) {
    changedFields.push('isbn');
  }

  if (goodreadsBook.rating && goodreadsBook.rating !== existingEntry.rating) {
    changedFields.push('rating');
  }
  const mergedRating = goodreadsBook.rating ?? existingEntry.rating ?? null;

  let reviewDescription = existingEntry.reviewDescription;
  let reviewText = existingEntry.reviewText;
  if (goodreadsBook.reviewText && goodreadsBook.reviewText !== existingEntry.reviewText) {
    reviewDescription = goodreadsBook.reviewDescription;
    reviewText = goodreadsBook.reviewText;
    changedFields.push('reviewDescription');
  }

  let readDateStarted = existingEntry.readDateStarted;
  let readDateFinished = existingEntry.readDateFinished;

  if (!existingEntry.readDateFinished && goodreadsBook.readDateFinished) {
    readDateFinished = goodreadsBook.readDateFinished;
    changedFields.push('readDateFinished');
  }
  if (!existingEntry.readDateStarted && goodreadsBook.readDateStarted) {
    readDateStarted = goodreadsBook.readDateStarted;
    changedFields.push('readDateStarted');
  }

  if (!existingEntry.coverImageId) {
    changedFields.push('coverImage');
  }

  return {
    action: changedFields.length > 0 || !existingEntry.isPublished ? 'update' : 'skip',
    changedFields,
    merged: {
      author,
      coverImageId: existingEntry.coverImageId,
      isbn,
      rating: mergedRating,
      readDateFinished,
      readDateStarted,
      reviewDescription,
      reviewText,
      title,
    },
  };
}

/**
 * Builds the localized CMA `fields` payload for a Contentful `book` entry.
 */
export function buildCmaBookFields(
  merged: MergedBookFields,
  locale = DEFAULT_LOCALE,
): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = {
    title: { [locale]: merged.title },
  };

  if (merged.author) {
    fields.author = { [locale]: merged.author };
  }
  if (typeof merged.isbn === 'number' && Number.isFinite(merged.isbn)) {
    fields.isbn = { [locale]: merged.isbn };
  }
  if (typeof merged.rating === 'number' && merged.rating > 0) {
    fields.rating = { [locale]: merged.rating };
  }
  if (merged.readDateStarted) {
    fields.readDateStarted = { [locale]: merged.readDateStarted };
  }
  if (merged.readDateFinished) {
    fields.readDateFinished = { [locale]: merged.readDateFinished };
  }
  if (merged.coverImageId) {
    fields.coverImage = {
      [locale]: {
        sys: {
          id: merged.coverImageId,
          linkType: 'Asset',
          type: 'Link',
        },
      },
    };
  }
  if (merged.reviewDescription) {
    fields.reviewDescription = { [locale]: merged.reviewDescription };
  }

  return fields;
}

async function probeImageCandidate(
  url: string | null | undefined,
  fetchImpl: FetchLike = fetch,
  minimumBytes = MIN_COVER_BYTES,
): Promise<CoverImageCandidate | null> {
  if (!url) {
    return null;
  }
  try {
    const res = await fetchImpl(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok || res.status === 404) {
      return null;
    }
    const contentLength = res.headers.get('content-length');
    if (contentLength !== null) {
      const bytes = Number.parseInt(contentLength, 10);
      if (Number.isFinite(bytes)) {
        if (bytes < minimumBytes) {
          return null;
        }
        return { bytes, url };
      }
    }
    return { bytes: 0, url };
  } catch {
    return null;
  }
}

async function fetchBookcoverCandidate(
  isbn: string | null | undefined,
  fetchImpl: FetchLike = fetch,
): Promise<CoverImageCandidate | null> {
  if (!isbn) {
    return null;
  }
  try {
    const res = await fetchImpl(`${BOOKCOVER_API_BASE_URL}/${isbn}`);
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { url?: string } | null;
    if (!data?.url) {
      return null;
    }
    return await probeImageCandidate(data.url, fetchImpl);
  } catch {
    return null;
  }
}

function cleanOpenLibraryTitle(title: string | null | undefined): string {
  return String(title ?? '').replace(/ \([^(#)]*#\d+\)$/, '');
}

function normalizeAlphanumeric(value: string | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function openLibraryTitleMatches(
  candidate: string | null | undefined,
  normalizedTitle: string,
): boolean {
  if (!candidate || !normalizedTitle) {
    return false;
  }
  const normalizedCandidate = normalizeAlphanumeric(candidate);
  if (!normalizedCandidate) {
    return false;
  }
  return (
    normalizedCandidate === normalizedTitle ||
    normalizedCandidate.includes(normalizedTitle) ||
    normalizedTitle.includes(normalizedCandidate)
  );
}

function openLibraryAuthorMatches(
  candidates: Array<string> | null | undefined,
  normalizedAuthor: string,
): boolean {
  if (!Array.isArray(candidates) || !normalizedAuthor) {
    return false;
  }
  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeAlphanumeric(candidate);
    if (!normalizedCandidate) {
      return false;
    }
    return (
      normalizedCandidate === normalizedAuthor ||
      normalizedCandidate.includes(normalizedAuthor) ||
      normalizedAuthor.includes(normalizedCandidate)
    );
  });
}

/**
 * Matches `OpenLibraryAPIService.prioritizedDocGroups(from:normalizedTitle:normalizedAuthor:)`:
 * filters to English docs when available, then orders groups:
 * 1. Both author and title match
 * 2. Author matches
 * 3. Title matches
 * 4. All docs
 */
export function prioritizeOpenLibraryDocGroups(
  docs: Array<OpenLibrarySearchDoc>,
  title: string,
  author: string,
): Array<Array<OpenLibrarySearchDoc>> {
  if (!Array.isArray(docs) || docs.length === 0) {
    return [];
  }
  const normalizedTitle = normalizeAlphanumeric(cleanOpenLibraryTitle(title));
  const normalizedAuthor = normalizeAlphanumeric(author);

  const englishDocs = docs.filter(
    (doc) => Array.isArray(doc?.language) && doc.language.includes('eng'),
  );
  const pool = englishDocs.length > 0 ? englishDocs : docs;

  const authorMatchesDocs = pool.filter((doc) =>
    openLibraryAuthorMatches(doc?.author_name, normalizedAuthor),
  );
  const titleMatchesDocs = pool.filter((doc) =>
    openLibraryTitleMatches(doc?.title, normalizedTitle),
  );
  const authorTitleMatchesDocs = authorMatchesDocs.filter((doc) =>
    openLibraryTitleMatches(doc?.title, normalizedTitle),
  );

  return [authorTitleMatchesDocs, authorMatchesDocs, titleMatchesDocs, pool].filter(
    (group) => group.length > 0,
  );
}

function preferredIsbnFromList(rawIsbns: Array<string> | null | undefined): number | null {
  if (!Array.isArray(rawIsbns)) {
    return null;
  }
  const cleaned = rawIsbns
    .map((raw) =>
      String(raw ?? '')
        .replace(/="/g, '')
        .replace(/"/g, '')
        .replace(/-/g, '')
        .replace(/\s+/g, '')
        .toUpperCase(),
    )
    .filter(Boolean);

  for (const candidate of cleaned) {
    const digitsOnly = candidate.replace(/\D/g, '');
    if (digitsOnly.length === 13) {
      const parsed = parseIsbn13Number(digitsOnly);
      if (parsed) {
        return parsed;
      }
    }
  }

  for (const candidate of cleaned) {
    if (candidate.length === 10) {
      const parsed = parseIsbn13Number(candidate);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function extractIsbnCandidatesFromDocs(
  docs: Array<OpenLibrarySearchDoc>,
  normalizedTitle: string,
  requireTitleMatch: boolean,
): Array<string> {
  const editionDocs = docs.flatMap((doc) =>
    Array.isArray(doc?.editions?.docs) ? doc.editions.docs : [],
  );
  const filteredEditions = requireTitleMatch
    ? editionDocs.filter((edition) => openLibraryTitleMatches(edition?.title, normalizedTitle))
    : editionDocs;
  return filteredEditions.flatMap((edition) => (Array.isArray(edition?.isbn) ? edition.isbn : []));
}

async function fetchOpenLibrarySearchDocs(
  title: string,
  author: string,
  fetchImpl: FetchLike = fetch,
): Promise<Array<OpenLibrarySearchDoc>> {
  try {
    const cleanedTitle = cleanOpenLibraryTitle(title);
    const params = new URLSearchParams({
      fields:
        'key,title,author_name,language,cover_i,cover_edition_key,editions,editions.title,editions.isbn',
      lang: 'en',
      q: `${cleanedTitle} ${author}`,
    });
    const res = await fetchImpl(`${OPENLIBRARY_API_BASE_URL}/search.json?${params.toString()}`);
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { docs?: Array<OpenLibrarySearchDoc> } | null;
    return Array.isArray(data?.docs) ? data.docs : [];
  } catch {
    return [];
  }
}

async function fetchIsbnsFromOpenLibraryWorkEditions(
  workKey: string | null | undefined,
  fetchImpl: FetchLike = fetch,
): Promise<Array<string> | null> {
  if (!workKey) {
    return null;
  }
  try {
    const res = await fetchImpl(`${OPENLIBRARY_API_BASE_URL}${workKey}/editions.json`);
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      entries?: Array<{
        isbn_13?: Array<string>;
        languages?: Array<{ key?: string }>;
      }>;
    } | null;
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    for (const edition of entries) {
      const langs = Array.isArray(edition?.languages) ? edition.languages : [];
      if (langs.some((lang) => lang?.key === '/languages/eng')) {
        if (Array.isArray(edition?.isbn_13) && edition.isbn_13.length > 0) {
          return edition.isbn_13;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolves a missing ISBN-13 from OpenLibrary search + work editions fallback,
 * matching `OpenLibraryAPIService.isbnFor(title:author:)` in Saga.
 */
export async function resolveIsbnFromOpenLibrary(
  title: string,
  author: string,
  fetchImpl: FetchLike = fetch,
): Promise<number | null> {
  const docs = await fetchOpenLibrarySearchDocs(title, author, fetchImpl);
  if (docs.length === 0) {
    return null;
  }

  const normalizedTitle = normalizeAlphanumeric(cleanOpenLibraryTitle(title));
  const docGroups = prioritizeOpenLibraryDocGroups(docs, title, author);

  for (const group of docGroups) {
    const exactTitleIsbns = extractIsbnCandidatesFromDocs(group, normalizedTitle, true);
    const exactMatch = preferredIsbnFromList(exactTitleIsbns);
    if (exactMatch) {
      return exactMatch;
    }

    const fallbackIsbns = extractIsbnCandidatesFromDocs(group, normalizedTitle, false);
    const fallbackMatch = preferredIsbnFromList(fallbackIsbns);
    if (fallbackMatch) {
      return fallbackMatch;
    }
  }

  const firstWorkKey = docGroups.map((group) => group[0]?.key).find(Boolean);
  if (firstWorkKey) {
    const editionsIsbns = await fetchIsbnsFromOpenLibraryWorkEditions(firstWorkKey, fetchImpl);
    const editionMatch = preferredIsbnFromList(editionsIsbns);
    if (editionMatch) {
      return editionMatch;
    }
  }

  return null;
}

async function fetchOpenLibraryCoverCandidate(
  isbn: string | null,
  title: string,
  author: string,
  fetchImpl: FetchLike = fetch,
): Promise<CoverImageCandidate | null> {
  let isbnCandidate: CoverImageCandidate | null = null;
  if (isbn) {
    isbnCandidate = await probeImageCandidate(
      `${OPENLIBRARY_COVERS_BASE_URL}/b/isbn/${isbn}-L.jpg?default=false`,
      fetchImpl,
    );
    if (isbnCandidate && isbnCandidate.bytes >= OPENLIBRARY_PREFERRED_COVER_BYTES) {
      return isbnCandidate;
    }
  }

  const docs = await fetchOpenLibrarySearchDocs(title, author, fetchImpl);
  const docGroups = prioritizeOpenLibraryDocGroups(docs, title, author);
  let checked = 0;
  let bestSearchCandidate: CoverImageCandidate | null = null;

  for (const group of docGroups) {
    for (const doc of group) {
      const candidateUrls: Array<string> = [];
      if (doc.cover_edition_key) {
        candidateUrls.push(
          `${OPENLIBRARY_COVERS_BASE_URL}/b/olid/${doc.cover_edition_key}-L.jpg?default=false`,
        );
      }
      if (doc.cover_i) {
        candidateUrls.push(
          `${OPENLIBRARY_COVERS_BASE_URL}/b/id/${doc.cover_i}-L.jpg?default=false`,
        );
      }

      for (const candidateUrl of candidateUrls) {
        if (checked >= MAX_OPENLIBRARY_SEARCH_CANDIDATES) {
          break;
        }
        checked += 1;
        const candidate = await probeImageCandidate(candidateUrl, fetchImpl);
        if (candidate && (!bestSearchCandidate || candidate.bytes > bestSearchCandidate.bytes)) {
          bestSearchCandidate = candidate;
        }
      }
      if (checked >= MAX_OPENLIBRARY_SEARCH_CANDIDATES) {
        break;
      }
    }
    if (checked >= MAX_OPENLIBRARY_SEARCH_CANDIDATES) {
      break;
    }
  }

  if (isbnCandidate && bestSearchCandidate) {
    return isbnCandidate.bytes >= bestSearchCandidate.bytes ? isbnCandidate : bestSearchCandidate;
  }
  return isbnCandidate ?? bestSearchCandidate;
}

function choosePreferredCoverCandidate(
  openLibrary: CoverImageCandidate | null,
  bookcover: CoverImageCandidate | null,
): CoverImageCandidate | null {
  if (!openLibrary) {
    return bookcover;
  }
  if (!bookcover) {
    return openLibrary;
  }
  if (
    bookcover.bytes >= BOOKCOVER_PREFERRED_MIN_BYTES &&
    bookcover.bytes >= openLibrary.bytes * BOOKCOVER_PREFERRED_RATIO
  ) {
    return bookcover;
  }
  return openLibrary.bytes >= bookcover.bytes ? openLibrary : bookcover;
}

/**
 * Resolves the best cover image URL for a book using the same priority order as `Book.swift`:
 * 1. OpenLibrary + Bookcover API (preferring high-resolution covers)
 * 2. Goodreads `<book_large_image_url>` fallback from the RSS feed
 */
export async function resolveBestCoverUrl(
  {
    author,
    goodreadsCoverUrl,
    isbn,
    title,
  }: {
    author: string;
    goodreadsCoverUrl?: string | null;
    isbn?: number | string | null;
    title: string;
  },
  fetchImpl: FetchLike = fetch,
): Promise<string | null> {
  const isbnStr = isbn ? String(isbn) : null;
  const openLibraryCandidate = await fetchOpenLibraryCoverCandidate(
    isbnStr,
    title,
    author,
    fetchImpl,
  );

  const shouldCheckBookcover =
    Boolean(isbnStr) &&
    (!openLibraryCandidate ||
      openLibraryCandidate.bytes < OPENLIBRARY_PREFER_BOOKCOVER_BELOW_BYTES);

  const bookcoverCandidate = shouldCheckBookcover
    ? await fetchBookcoverCandidate(isbnStr, fetchImpl)
    : null;

  const preferred = choosePreferredCoverCandidate(openLibraryCandidate, bookcoverCandidate);
  if (preferred?.url) {
    return preferred.url;
  }

  if (isUsableGoodreadsCoverUrl(goodreadsCoverUrl)) {
    return upgradeGoodreadsCoverUrl(goodreadsCoverUrl);
  }

  return null;
}

export class ContentfulCmaError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ContentfulCmaError';
    this.status = status;
    this.body = body;
  }
}

export class ContentfulCmaClient {
  readonly spaceId: string;
  readonly environmentId: string;
  readonly managementToken: string;
  readonly locale: string;
  readonly fetchImpl: FetchLike;
  readonly baseUrl: string;
  readonly uploadUrl: string;

  constructor({
    environmentId = DEFAULT_ENVIRONMENT_ID,
    fetchImpl = fetch,
    locale = DEFAULT_LOCALE,
    managementToken,
    spaceId,
  }: {
    environmentId?: string;
    fetchImpl?: FetchLike;
    locale?: string;
    managementToken: string;
    spaceId: string;
  }) {
    if (!spaceId) {
      throw new Error('Missing CONTENTFUL_SPACE_ID');
    }
    if (!managementToken) {
      throw new Error('Missing CONTENTFUL_MANAGEMENT_ACCESS_TOKEN');
    }
    this.spaceId = spaceId;
    this.environmentId = environmentId;
    this.managementToken = managementToken;
    this.locale = locale;
    this.fetchImpl = fetchImpl;
    this.baseUrl = `${CONTENTFUL_CMA_BASE_URL}/spaces/${spaceId}/environments/${environmentId}`;
    this.uploadUrl = `${CONTENTFUL_UPLOAD_BASE_URL}/spaces/${spaceId}/uploads`;
  }

  async request<T = unknown>(
    path: string,
    {
      body,
      headers = {},
      method = 'GET',
    }: {
      body?: unknown;
      headers?: Record<string, string>;
      method?: string;
    } = {},
  ): Promise<T> {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers: {
          Authorization: `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          ...headers,
        },
        method,
      });

      if (response.status === 429 && attempt < maxRetries - 1) {
        const resetSec =
          Number.parseFloat(response.headers.get('x-contentful-ratelimit-reset') ?? '1') || 1;
        await new Promise((resolve) => setTimeout(resolve, resetSec * 1000));
        continue;
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 500));
        continue;
      }

      const text = await response.text();
      let data: unknown = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        throw new ContentfulCmaError(
          `Contentful CMA ${method} ${path} failed (${response.status}): ${text.slice(0, 300)}`,
          response.status,
          data,
        );
      }

      return data as T;
    }
    throw new Error(`Contentful CMA ${method} ${path} exhausted retries`);
  }

  async fetchAllBooks(): Promise<Array<NormalizedContentfulBookEntry>> {
    const items: Array<NormalizedContentfulBookEntry> = [];
    let skip = 0;
    const limit = 200;

    while (true) {
      const page = await this.request<{
        items?: Array<{
          fields?: Record<string, unknown>;
          sys?: { id?: string; publishedVersion?: number; version?: number };
        }>;
        total?: number;
      }>(`/entries?content_type=book&limit=${limit}&skip=${skip}`);
      const pageItems = Array.isArray(page?.items) ? page.items : [];
      items.push(...pageItems.map((entry) => normalizeContentfulBookEntry(entry, this.locale)));
      skip += pageItems.length;
      if (pageItems.length === 0 || skip >= (page?.total ?? 0)) {
        break;
      }
    }

    return items;
  }

  async fetchBookById(entryId: string): Promise<NormalizedContentfulBookEntry | null> {
    try {
      const entry = await this.request<{
        fields?: Record<string, unknown>;
        sys?: { id?: string; publishedVersion?: number; version?: number };
      }>(`/entries/${encodeURIComponent(entryId)}`);
      return normalizeContentfulBookEntry(entry, this.locale);
    } catch (error) {
      if (error instanceof ContentfulCmaError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOrReuseFallbackAsset(): Promise<string | null> {
    const page = await this.request<{
      items?: Array<{ sys?: { id?: string; publishedVersion?: number } }>;
    }>('/assets?limit=10');
    const items = Array.isArray(page?.items) ? page.items : [];
    const publishedAsset = items.find((a) => typeof a?.sys?.publishedVersion === 'number');
    return publishedAsset?.sys?.id ?? items[0]?.sys?.id ?? null;
  }

  async uploadFile(binaryBuffer: Uint8Array): Promise<string> {
    const response = await this.fetchImpl(this.uploadUrl, {
      body: binaryBuffer as unknown as BodyInit,
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
        'Content-Type': 'application/octet-stream',
      },
      method: 'POST',
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `Contentful binary upload failed (${response.status}): ${text.slice(0, 300)}`,
      );
    }
    const data = text ? (JSON.parse(text) as { sys?: { id?: string } }) : null;
    if (!data?.sys?.id) {
      throw new Error('Contentful binary upload response missing sys.id');
    }
    return data.sys.id;
  }

  async createAndPublishCoverAsset({
    assetId = crypto.randomUUID().toUpperCase(),
    imageUrl,
    title,
  }: {
    assetId?: string;
    imageUrl: string;
    title?: string | null;
  }): Promise<string> {
    const fileName = `${assetId}.jpg`;
    const contentType = 'image/jpeg';

    let filePayload: Record<string, unknown> = {
      contentType,
      fileName,
      upload: imageUrl,
    };

    try {
      const imageRes = await this.fetchImpl(imageUrl, { method: 'GET', redirect: 'follow' });
      if (imageRes.ok) {
        const arrayBuffer = await imageRes.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const uploadId = await this.uploadFile(new Uint8Array(arrayBuffer));
          filePayload = {
            contentType,
            fileName,
            uploadFrom: {
              sys: {
                id: uploadId,
                linkType: 'Upload',
                type: 'Link',
              },
            },
          };
        }
      }
    } catch {
      // Fall back to direct remote URL `upload: imageUrl` if binary upload endpoint fails
    }

    const bodyFields: Record<string, unknown> = {
      file: {
        [this.locale]: filePayload,
      },
    };
    if (title) {
      bodyFields.title = { [this.locale]: title };
    }

    const created = await this.request<{ sys: { version: number } }>(`/assets/${assetId}`, {
      body: {
        fields: bodyFields,
      },
      method: 'PUT',
    });

    await this.request(`/assets/${assetId}/files/${this.locale}/process`, {
      headers: {
        'X-Contentful-Version': String(created.sys.version),
      },
      method: 'PUT',
    });

    let processedAsset: {
      fields?: { file?: Record<string, { url?: string }> };
      sys: { version: number };
    } | null = null;
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const delayMs = Math.min(1000 * 2 ** Math.min(attempt, 3), 8000);
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 750 : delayMs));
      const candidate = await this.request<{
        fields?: { file?: Record<string, { url?: string }> };
        sys: { version: number };
      }>(`/assets/${assetId}`);
      const fileField = candidate?.fields?.file?.[this.locale];
      if (fileField?.url) {
        processedAsset = candidate;
        break;
      }
    }

    if (!processedAsset) {
      throw new Error(`Timed out waiting for Contentful asset ${assetId} to process`);
    }

    await this.request(`/assets/${assetId}/published`, {
      headers: {
        'X-Contentful-Version': String(processedAsset.sys.version),
      },
      method: 'PUT',
    });

    return assetId;
  }

  async createAndPublishBook(
    fields: Record<string, unknown>,
    entryId = crypto.randomUUID().toUpperCase(),
  ): Promise<{
    fields?: Record<string, unknown>;
    sys?: { id?: string; publishedVersion?: number; version?: number };
  }> {
    const created = await this.request<{ sys: { version: number } }>(`/entries/${entryId}`, {
      body: { fields },
      headers: {
        'X-Contentful-Content-Type': 'book',
      },
      method: 'PUT',
    });

    return await this.request(`/entries/${entryId}/published`, {
      headers: {
        'X-Contentful-Version': String(created.sys.version),
      },
      method: 'PUT',
    });
  }

  async updateAndPublishBook(
    entryId: string,
    version: number,
    fields: Record<string, unknown>,
  ): Promise<{
    fields?: Record<string, unknown>;
    sys?: { id?: string; publishedVersion?: number; version?: number };
  }> {
    const updated = await this.request<{ sys: { version: number } }>(`/entries/${entryId}`, {
      body: { fields },
      headers: {
        'X-Contentful-Version': String(version),
      },
      method: 'PUT',
    });

    return await this.request(`/entries/${entryId}/published`, {
      headers: {
        'X-Contentful-Version': String(updated.sys.version),
      },
      method: 'PUT',
    });
  }

  async unpublishAndDeleteBook(entryId: string): Promise<boolean> {
    const existing = await this.fetchBookById(entryId);
    if (!existing) {
      return false;
    }

    if (existing.publishedVersion !== null) {
      try {
        await this.request(`/entries/${encodeURIComponent(entryId)}/published`, {
          method: 'DELETE',
        });
      } catch (error) {
        if (!(error instanceof ContentfulCmaError && error.status === 404)) {
          throw error;
        }
      }
    }

    await this.request(`/entries/${encodeURIComponent(entryId)}`, {
      method: 'DELETE',
    });

    return true;
  }

  async upsertBook(input: BookMutationInput): Promise<BookMutationOutcome> {
    const title = cleanWhitespace(input.title);
    if (!title) {
      throw new Error('Book title is required');
    }

    const author = cleanWhitespace(input.author ?? '');
    const parsedIsbn = parseIsbn13Number(input.isbn);
    const rating =
      typeof input.rating === 'number' && Number.isInteger(input.rating) && input.rating > 0
        ? input.rating
        : null;
    const readDateStarted =
      parseGoodreadsDate(input.readDateStarted) ?? input.readDateStarted ?? null;
    const readDateFinished =
      parseGoodreadsDate(input.readDateFinished) ?? input.readDateFinished ?? null;

    const existingById = input.id ? await this.fetchBookById(input.id) : null;
    const existing =
      existingById ??
      findMatchingContentfulEntry(
        { author, id: input.id, isbn: parsedIsbn, title },
        await this.fetchAllBooks(),
      );

    let isbn = parsedIsbn ?? existing?.isbn ?? null;
    if (!isbn && author) {
      isbn = await resolveIsbnFromOpenLibrary(title, author, this.fetchImpl);
    }

    const reviewDescription =
      input.reviewDescription !== undefined
        ? input.reviewDescription
        : input.reviewText !== undefined
          ? buildRichTextDocument(input.reviewText)
          : (existing?.reviewDescription ?? null);
    const reviewText =
      input.reviewText !== undefined
        ? normalizeReviewText(input.reviewText) || null
        : extractPlainTextFromRichText(reviewDescription) || null;

    let coverImageId = input.coverImageId ?? existing?.coverImageId ?? null;
    if (input.coverImageUrl && isUsableGoodreadsCoverUrl(input.coverImageUrl)) {
      coverImageId = await this.createAndPublishCoverAsset({
        imageUrl: input.coverImageUrl,
        title,
      });
    } else if (!coverImageId) {
      const resolvedCoverUrl = await resolveBestCoverUrl({ author, isbn, title }, this.fetchImpl);
      if (resolvedCoverUrl) {
        try {
          coverImageId = await this.createAndPublishCoverAsset({
            imageUrl: resolvedCoverUrl,
            title,
          });
        } catch {
          coverImageId = await this.createOrReuseFallbackAsset();
        }
      } else {
        coverImageId = await this.createOrReuseFallbackAsset();
      }
    }

    const merged: MergedBookFields = {
      author: author || existing?.author || '',
      coverImageId,
      isbn,
      rating: input.rating !== undefined ? rating : (existing?.rating ?? null),
      readDateFinished:
        input.readDateFinished !== undefined
          ? readDateFinished
          : (existing?.readDateFinished ?? null),
      readDateStarted:
        input.readDateStarted !== undefined ? readDateStarted : (existing?.readDateStarted ?? null),
      reviewDescription,
      reviewText,
      title,
    };

    const fields = buildCmaBookFields(merged, this.locale);

    if (existing) {
      const published = await this.updateAndPublishBook(existing.id, existing.version, fields);
      const normalized = normalizeContentfulBookEntry(published, this.locale);
      return {
        action: 'updated',
        author: normalized.author,
        coverImageId: normalized.coverImageId,
        id: normalized.id,
        isbn: normalized.isbn,
        rating: normalized.rating,
        readDateFinished: normalized.readDateFinished,
        readDateStarted: normalized.readDateStarted,
        reviewText: normalized.reviewText,
        title: normalized.title,
        version: normalized.version,
      };
    }

    if (!merged.coverImageId) {
      throw new Error(
        `Cannot create "${merged.title}" without a coverImage asset (required by Contentful schema)`,
      );
    }

    const requestedId = input.id ? cleanWhitespace(input.id).toUpperCase() : undefined;
    const published = await this.createAndPublishBook(fields, requestedId);
    const normalized = normalizeContentfulBookEntry(published, this.locale);
    return {
      action: 'created',
      author: normalized.author,
      coverImageId: normalized.coverImageId,
      id: normalized.id,
      isbn: normalized.isbn,
      rating: normalized.rating,
      readDateFinished: normalized.readDateFinished,
      readDateStarted: normalized.readDateStarted,
      reviewText: normalized.reviewText,
      title: normalized.title,
      version: normalized.version,
    };
  }
}

export function buildGoodreadsRssUrl({
  perPage = 200,
  rssKey,
  shelf,
  userId,
}: {
  perPage?: number;
  rssKey?: string | null;
  shelf: string;
  userId: string;
}): string {
  const params = new URLSearchParams({
    per_page: String(perPage),
    shelf,
  });
  if (rssKey) {
    params.set('key', rssKey);
  }
  return `https://www.goodreads.com/review/list_rss/${encodeURIComponent(userId)}?${params.toString()}`;
}

export async function fetchGoodreadsShelfItems({
  fetchImpl = fetch,
  rssKey,
  shelves = DEFAULT_SHELVES,
  userId,
}: {
  fetchImpl?: FetchLike;
  rssKey?: string | null;
  shelves?: ReadonlyArray<string>;
  userId: string;
}): Promise<Array<GoodreadsBookItem>> {
  const shelfResults = await Promise.all(
    shelves.map(async (shelf) => {
      const url = buildGoodreadsRssUrl({ rssKey, shelf, userId });
      const response = await fetchImpl(url, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
          'User-Agent': 'Saga-Goodreads-Sync/1.0',
        },
      });
      if (!response.ok) {
        throw new Error(`Goodreads RSS fetch failed for shelf "${shelf}" (${response.status})`);
      }
      const xml = await response.text();
      return parseGoodreadsRssXml(xml, shelf);
    }),
  );

  return mergeShelfBooks(shelfResults.flat());
}

/**
 * Runs a full sync from Goodreads RSS feeds to Contentful CMA.
 */
export async function runGoodreadsSync({
  contentfulEnvironmentId = DEFAULT_ENVIRONMENT_ID,
  contentfulManagementToken,
  contentfulSpaceId,
  dryRun = false,
  fetchImpl = fetch,
  goodreadsRssKey,
  goodreadsUserId,
  shelves = DEFAULT_SHELVES,
}: {
  contentfulEnvironmentId?: string;
  contentfulManagementToken: string;
  contentfulSpaceId: string;
  dryRun?: boolean;
  fetchImpl?: FetchLike;
  goodreadsRssKey?: string | null;
  goodreadsUserId: string;
  shelves?: ReadonlyArray<string>;
}): Promise<GoodreadsSyncSummary> {
  const startedAt = Date.now();
  const cma = new ContentfulCmaClient({
    environmentId: contentfulEnvironmentId,
    fetchImpl,
    managementToken: contentfulManagementToken,
    spaceId: contentfulSpaceId,
  });

  const [goodreadsBooks, existingEntries] = await Promise.all([
    fetchGoodreadsShelfItems({
      fetchImpl,
      rssKey: goodreadsRssKey,
      shelves,
      userId: goodreadsUserId,
    }),
    cma.fetchAllBooks(),
  ]);

  const applicableBooks = goodreadsBooks.filter(
    (book) =>
      book.status === 'read' ||
      book.status === 'reading' ||
      findMatchingContentfulEntry(book, existingEntries) !== null,
  );

  const summary: GoodreadsSyncSummary = {
    applicableBooksCount: applicableBooks.length,
    created: [],
    createdCount: 0,
    dryRun,
    durationMs: 0,
    errors: [],
    existingContentfulBooksCount: existingEntries.length,
    goodreadsItemsFetched: goodreadsBooks.length,
    ok: true,
    shelvesPolled: shelves,
    skippedCount: 0,
    updated: [],
    updatedCount: 0,
  };

  let fallbackCoverAssetId: string | null = null;

  for (const goodreadsBook of applicableBooks) {
    try {
      const existing = findMatchingContentfulEntry(goodreadsBook, existingEntries);
      const diff = computeBookDiff(goodreadsBook, existing);

      if (diff.action === 'skip') {
        summary.skippedCount += 1;
        continue;
      }

      const merged: MergedBookFields = { ...diff.merged };

      if (!merged.isbn) {
        merged.isbn = await resolveIsbnFromOpenLibrary(merged.title, merged.author, fetchImpl);
      }

      if (!merged.coverImageId && !dryRun) {
        const coverUrl = await resolveBestCoverUrl(
          {
            author: merged.author,
            goodreadsCoverUrl: goodreadsBook.goodreadsCoverUrl,
            isbn: merged.isbn,
            title: merged.title,
          },
          fetchImpl,
        );

        if (coverUrl) {
          try {
            merged.coverImageId = await cma.createAndPublishCoverAsset({
              imageUrl: coverUrl,
              title: merged.title,
            });
          } catch {
            fallbackCoverAssetId = fallbackCoverAssetId ?? (await cma.createOrReuseFallbackAsset());
            merged.coverImageId = fallbackCoverAssetId;
          }
        } else {
          fallbackCoverAssetId = fallbackCoverAssetId ?? (await cma.createOrReuseFallbackAsset());
          merged.coverImageId = fallbackCoverAssetId;
        }
      }

      if (diff.action === 'create') {
        if (!dryRun) {
          if (!merged.coverImageId) {
            throw new Error(
              `Cannot create "${merged.title}" without a coverImage asset (required by Contentful schema)`,
            );
          }
          const fields = buildCmaBookFields(merged);
          const createdEntry = await cma.createAndPublishBook(fields);
          existingEntries.push(normalizeContentfulBookEntry(createdEntry));
        }
        summary.createdCount += 1;
        summary.created.push({
          author: merged.author,
          changedFields: diff.changedFields,
          status: goodreadsBook.status,
          title: merged.title,
        });
      } else if (diff.action === 'update' && existing) {
        if (!dryRun) {
          const fields = {
            ...existing.rawFields,
            ...buildCmaBookFields(merged),
          };
          await cma.updateAndPublishBook(existing.id, existing.version, fields);
        }
        summary.updatedCount += 1;
        summary.updated.push({
          author: merged.author,
          changedFields: diff.changedFields,
          id: existing.id,
          status: goodreadsBook.status,
          title: merged.title,
        });
      }
    } catch (error) {
      summary.errors.push({
        author: goodreadsBook.author,
        message: error instanceof Error ? error.message : String(error),
        title: goodreadsBook.title,
      });
    }
  }

  summary.ok = summary.errors.length === 0;
  summary.durationMs = Date.now() - startedAt;
  return summary;
}
