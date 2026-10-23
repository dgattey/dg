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

/**
 * Derives reading status from `readDateFinished` and `readDateStarted`, matching Saga (`Book.swift`).
 */
export function deriveReadingStatus({
  readDateFinished,
  readDateStarted,
}: {
  readDateFinished?: string | null;
  readDateStarted?: string | null;
}): ReadingStatus {
  if (cleanWhitespace(readDateFinished)) {
    return 'read';
  }
  if (cleanWhitespace(readDateStarted)) {
    return 'reading';
  }
  return 'notStarted';
}

export function toRenderableBook(book: Book | null | undefined): RenderableBook | null {
  const title = cleanBookTitle(book?.title);
  const author = cleanWhitespace(book?.author);
  const readDateFinished = cleanWhitespace(book?.readDateFinished) || null;
  const readDateStarted = cleanWhitespace(book?.readDateStarted) || null;
  const readingStatus = deriveReadingStatus({ readDateFinished, readDateStarted });
  if (!title || !author || readingStatus === 'notStarted') {
    return null;
  }

  const rawCover = book?.coverImage;
  const thumbnailUrl = normalizeContentfulAssetUrl(rawCover?.url);
  const thumbnail =
    thumbnailUrl && rawCover?.width != null && rawCover?.height != null
      ? {
          height: rawCover.height,
          url: thumbnailUrl,
          width: rawCover.width,
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
    readDateFinished,
    readingStatus,
    review: reviewText || null,
    thumbnail,
    title,
  };
}
