import { BLOCKS } from '@contentful/rich-text-types';
import { isRecord } from '@dg/shared-core/types/typeguards';

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_ENVIRONMENT_ID = 'master';
export const DEFAULT_SHELVES = ['currently-reading', 'read'] as const;
export const ALLOWED_COVER_IMAGE_HOSTS = [
  'covers.openlibrary.org',
  'bookcover.longitood.com',
  'i.gr-assets.com',
  's.gr-assets.com',
  'images-na.ssl-images-amazon.com',
  'm.media-amazon.com',
  'images.ctfassets.net',
] as const;

const ALLOWED_HOST_SET: ReadonlySet<string> = new Set(ALLOWED_COVER_IMAGE_HOSTS);
export const ALLOWED_COVER_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;
export type CoverImageContentType = (typeof ALLOWED_COVER_IMAGE_CONTENT_TYPES)[number];
export const MAX_COVER_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_SYNC_RAW_BODY_BYTES = 4_500_000;
export const MAX_SYNC_BATCH_SIZE = 100;
export const MAX_BOOK_ID_LENGTH = 64;
export const MAX_BOOK_TITLE_LENGTH = 500;
export const MAX_BOOK_AUTHOR_LENGTH = 500;
export const MAX_BOOK_REVIEW_LENGTH = 50_000;
export const MAX_BOOK_NOTES_LENGTH = 50_000;
const MAX_COVER_IMAGE_URL_LENGTH = 2048;
export const MIN_BOOK_RATING = 1;
export const MAX_BOOK_RATING = 5;

const CONTENTFUL_ENTITY_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const NAMED_ENTITIES: Record<string, string> = {
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

export const READING_STATUS_VALUES = ['notStarted', 'reading', 'read'] as const;
export type ReadingStatus = (typeof READING_STATUS_VALUES)[number];

export const isReadingStatus = (value: unknown): value is ReadingStatus =>
  typeof value === 'string' && (READING_STATUS_VALUES as ReadonlyArray<string>).includes(value);
export type RichTextDocument = {
  content: Array<{
    content: Array<{
      data: Record<string, never>;
      marks: Array<never>;
      nodeType: 'text';
      value: string;
    }>;
    data: Record<string, never>;
    nodeType: typeof BLOCKS.PARAGRAPH;
  }>;
  data: Record<string, never>;
  nodeType: typeof BLOCKS.DOCUMENT;
};

const normalizeApostrophes = (input: string): string => input.replace(/[\u2018\u2019]/g, "'");

export const cleanWhitespace = (input: string | null | undefined): string =>
  input ? String(input).replace(/\s+/g, ' ').trim() : '';

export const normalizeAuthor = (author: string | null | undefined): string =>
  normalizeApostrophes(cleanWhitespace(author)).toLowerCase();

const normalizeTitle = (title: string | null | undefined): string =>
  normalizeApostrophes(cleanWhitespace(title)).toLowerCase();

export const isDuplicateTitle = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => {
  const [nA, nB] = [normalizeTitle(a), normalizeTitle(b)];
  if (!nA || !nB) return false;
  if (nA === nB) return true;
  const [shorter, longer] = nA.length < nB.length ? [nA, nB] : [nB, nA];
  return (
    longer.startsWith(`${shorter}:`) ||
    longer.startsWith(`${shorter} (`) ||
    longer.startsWith(`${shorter} -`)
  );
};

/**
 * Identifies legacy Contentful book entries whose `readDateStarted` and `readDateFinished`
 * were both backfilled with the same Goodreads `user_date_added` / `user_date_created`
 * timestamp when `<user_read_at>` was empty.
 */
export function isBackfilledBookReadDate({
  readDateFinished,
  readDateStarted,
  reviewText,
}: {
  readDateFinished?: string | null;
  readDateStarted?: string | null;
  reviewText?: string | null;
}): boolean {
  const finished = cleanWhitespace(readDateFinished);
  const started = cleanWhitespace(readDateStarted);
  return Boolean(finished && started && finished === started && !cleanWhitespace(reviewText));
}

export function decodeXmlEntities(input: string | null | undefined): string {
  if (!input) return '';
  return String(input).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, entity: string) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    const lower = entity.toLowerCase();
    return Object.hasOwn(NAMED_ENTITIES, lower) ? (NAMED_ENTITIES[lower] ?? full) : full;
  });
}

function isbn13CheckDigit(twelveDigits: string): string | null {
  if (!/^\d{12}$/.test(twelveDigits)) return null;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number.parseInt(twelveDigits[i] ?? '0', 10) * (i % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

export function parseIsbn13Number(raw: number | string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    return Number.isSafeInteger(raw) && raw > 0 && String(raw).length === 13 ? raw : null;
  }
  const norm = String(raw)
    .replace(/="/g, '')
    .replace(/["-\s]+/g, '')
    .toUpperCase();
  const full13 = /^\d{13}$/.test(norm)
    ? norm
    : /^\d{9}[\dX]$/.test(norm)
      ? `978${norm.slice(0, 9)}${isbn13CheckDigit(`978${norm.slice(0, 9)}`) ?? ''}`
      : '';
  const num = full13.length === 13 ? Number.parseInt(full13, 10) : Number.NaN;
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

const splitReviewParagraphs = (raw: string | null | undefined): Array<string> =>
  raw
    ? decodeXmlEntities(String(raw).replace(/\r\n?|<br\s*\/?>/gi, '\n'))
        .split(/\n+/)
        .map(cleanWhitespace)
        .filter(Boolean)
    : [];

export const normalizeReviewText = (raw: string | null | undefined): string =>
  splitReviewParagraphs(raw).join('\n\n');

export function buildRichTextDocument(raw: string | null | undefined): RichTextDocument | null {
  const paragraphs = splitReviewParagraphs(raw);
  return paragraphs.length === 0
    ? null
    : {
        content: paragraphs.map((value) => ({
          content: [{ data: {}, marks: [], nodeType: 'text', value }],
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
        })),
        data: {},
        nodeType: BLOCKS.DOCUMENT,
      };
}

export function extractPlainTextFromRichText(doc: unknown): string {
  if (!isRecord(doc) || !Array.isArray(doc.content)) return '';
  const walk = (n: unknown): string =>
    !isRecord(n)
      ? ''
      : n.nodeType === 'text' && typeof n.value === 'string'
        ? n.value
        : Array.isArray(n.content)
          ? n.content.map(walk).join('')
          : '';
  return doc.content
    .map((n) => walk(n).trim())
    .filter(Boolean)
    .join('\n\n');
}

export function parseGoodreadsDate(raw: string | null | undefined): string | null {
  const trimmed = raw ? String(raw).trim() : '';
  if (!trimmed) return null;
  const slash = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slash) return `${slash[1]}-${slash[2]}-${slash[3]}T00:00:00Z`;
  const ts = Date.parse(trimmed);
  return Number.isNaN(ts) ? null : new Date(ts).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export const isValidContentfulEntityId = (id: string | null | undefined): boolean =>
  typeof id === 'string' && CONTENTFUL_ENTITY_ID_PATTERN.test(id.trim());

export function isAllowedCoverImageUrl(rawUrl: string | null | undefined): boolean {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!trimmed || trimmed.length > MAX_COVER_IMAGE_URL_LENGTH) return false;
  try {
    const u = new URL(trimmed);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      (!u.port || u.port === '443') &&
      ALLOWED_HOST_SET.has(u.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export const isUsableGoodreadsCoverUrl = (url: string | null | undefined): boolean =>
  Boolean(url && isAllowedCoverImageUrl(url) && !/nophoto/i.test(url));

export const upgradeGoodreadsCoverUrl = (url: string | null | undefined): string | null =>
  url && isUsableGoodreadsCoverUrl(url)
    ? url.trim().replace(/\._S[XY]\d+_(?=\.[a-zA-Z]+$)/, '')
    : null;

const STANDARD_BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

type DecodedCoverImageResult = { bytes: Uint8Array; ok: true } | { error: string; ok: false };

export function decodeCoverImageBase64(raw: string): DecodedCoverImageResult {
  if (/^\s*data:/i.test(raw)) {
    return {
      error: 'Book coverImageBase64 must not include a data: URI prefix',
      ok: false,
    };
  }
  if (raw.length === 0 || raw.length % 4 !== 0 || !STANDARD_BASE64_PATTERN.test(raw)) {
    return {
      error:
        'Book coverImageBase64 must be a valid standard base64 string with padding and no line breaks',
      ok: false,
    };
  }
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  const expectedByteLength = (raw.length / 4) * 3 - padding;
  if (expectedByteLength <= 0) {
    return {
      error:
        'Book coverImageBase64 must be a valid standard base64 string with padding and no line breaks',
      ok: false,
    };
  }
  if (expectedByteLength > MAX_COVER_IMAGE_BYTES) {
    return {
      error: `Book coverImageBase64 exceeds maximum decoded size of ${MAX_COVER_IMAGE_BYTES} bytes (3 MiB)`,
      ok: false,
    };
  }
  const buffer = Buffer.from(raw, 'base64');
  if (buffer.byteLength !== expectedByteLength || buffer.toString('base64') !== raw) {
    return {
      error:
        'Book coverImageBase64 must be a valid standard base64 string with padding and no line breaks',
      ok: false,
    };
  }
  return {
    bytes: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
    ok: true,
  };
}

export function normalizeContentfulAssetUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('https://')) return trimmed;
  return null;
}
