import {
  cleanWhitespace,
  extractPlainTextFromRichText,
  isBackfilledBookReadDate,
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
 * Derives reading status from `readDateFinished` and `readDateStarted`, with a fallback to
 * `'read'` for undated finished books that carry a star rating or review.
 */
export function deriveReadingStatus({
  rating,
  readDateFinished,
  readDateStarted,
  review,
}: {
  rating?: number | null;
  readDateFinished?: string | null;
  readDateStarted?: string | null;
  review?: string | null;
}): ReadingStatus {
  if (cleanWhitespace(readDateFinished)) {
    return 'read';
  }
  if (cleanWhitespace(readDateStarted)) {
    return 'reading';
  }
  if ((typeof rating === 'number' && rating >= 1 && rating <= 5) || cleanWhitespace(review)) {
    return 'read';
  }
  return 'notStarted';
}

export function toRenderableBook(book: Book | null | undefined): RenderableBook | null {
  const title = cleanWhitespace(book?.title);
  const author = cleanWhitespace(book?.author);
  const rawReadDateFinished = cleanWhitespace(book?.readDateFinished) || null;
  const rawReadDateStarted = cleanWhitespace(book?.readDateStarted) || null;
  const reviewText = book?.reviewDescription?.json
    ? extractPlainTextFromRichText(book.reviewDescription.json)
    : '';
  const rating =
    typeof book?.rating === 'number' && book.rating >= 1 && book.rating <= 5
      ? Math.round(book.rating)
      : null;
  const backfilled = isBackfilledBookReadDate({
    readDateFinished: rawReadDateFinished,
    readDateStarted: rawReadDateStarted,
    reviewText,
  });
  const readDateFinished = backfilled ? null : rawReadDateFinished;
  const readDateStarted = backfilled ? null : rawReadDateStarted;
  const readingStatus = deriveReadingStatus({
    rating,
    readDateFinished: rawReadDateFinished,
    readDateStarted,
    review: reviewText,
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
