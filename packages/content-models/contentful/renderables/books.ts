import {
  cleanWhitespace,
  extractPlainTextFromRichText,
  isReadingStatus,
  normalizeContentfulAssetUrl,
  type ReadingStatus,
} from '../../books/bookDomain';
import type { Book } from '../schema/books';

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
 * Resolves `readingStatus` from the explicit Contentful `readingStatus` field when set,
 * falling back to `readDateFinished` and `readDateStarted`.
 */
export function deriveReadingStatus({
  readDateFinished,
  readDateStarted,
  readingStatus,
}: {
  readDateFinished?: string | null;
  readDateStarted?: string | null;
  readingStatus?: string | null;
}): ReadingStatus {
  const trimmedStatus = cleanWhitespace(readingStatus);
  if (isReadingStatus(trimmedStatus)) {
    return trimmedStatus;
  }
  if (cleanWhitespace(readDateFinished)) {
    return 'read';
  }
  if (cleanWhitespace(readDateStarted)) {
    return 'reading';
  }
  return 'notStarted';
}

export function toRenderableBook(book: Book | null | undefined): RenderableBook | null {
  const title = cleanWhitespace(book?.title);
  const author = cleanWhitespace(book?.author);
  const readDateFinished = cleanWhitespace(book?.readDateFinished) || null;
  const readDateStarted = cleanWhitespace(book?.readDateStarted) || null;
  const readingStatus = deriveReadingStatus({
    readDateFinished,
    readDateStarted,
    readingStatus: book?.readingStatus,
  });
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
