import {
  cleanWhitespace,
  extractPlainTextFromRichText,
  normalizeContentfulAssetUrl,
  type ReadingStatus,
} from '../../books/bookDomain';
import type { Book } from '../schema/books';

const SERIES_SUFFIX_PATTERN = /\s*\([^)]*#\d+[^)]*\)\s*$/;

/**
 * Strips Goodreads series suffixes such as `(Dune, #1)` from display titles.
 */
export function cleanBookTitle(raw: string | null | undefined): string {
  return cleanWhitespace(raw).replace(SERIES_SUFFIX_PATTERN, '').trim();
}

export type RenderableBook = {
  id: string;
  title: string;
  author: string;
  rating: number | null;
  readDateFinished: string | null;
  readingStatus: ReadingStatus;
  review: string | null;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  } | null;
};

const VALID_READING_STATUSES: ReadonlySet<string> = new Set(['notStarted', 'read', 'reading']);

function parseReadingStatus(raw: string | null | undefined): ReadingStatus {
  if (raw && VALID_READING_STATUSES.has(raw)) {
    return raw as ReadingStatus;
  }
  return 'read';
}

export function toRenderableBook(book: Book | null | undefined): RenderableBook | null {
  const title = cleanBookTitle(book?.title);
  const author = cleanWhitespace(book?.author);
  if (!title || !author) {
    return null;
  }

  const rawThumbnail = book?.thumbnail;
  const thumbnailUrl = normalizeContentfulAssetUrl(rawThumbnail?.url);
  const thumbnail =
    thumbnailUrl && rawThumbnail?.width != null && rawThumbnail?.height != null
      ? {
          height: rawThumbnail.height,
          url: thumbnailUrl,
          width: rawThumbnail.width,
        }
      : null;

  const reviewText = book?.reviewDescription?.json
    ? extractPlainTextFromRichText(book.reviewDescription.json)
    : '';
  const rating =
    typeof book?.rating === 'number' && book.rating >= 1 && book.rating <= 5
      ? Math.round(book.rating)
      : null;

  return {
    author,
    id: book?.sys?.id?.trim() || `${title}-${author}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating,
    readDateFinished: book?.readDateFinished ?? null,
    readingStatus: parseReadingStatus(book?.readingStatus),
    review: reviewText || null,
    thumbnail,
    title,
  };
}
