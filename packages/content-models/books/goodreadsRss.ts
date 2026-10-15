import {
  buildRichTextDocument,
  cleanWhitespace,
  decodeXmlEntities,
  isDuplicateTitle,
  normalizeAuthor,
  normalizeReviewText,
  parseGoodreadsDate,
  parseIsbn13Number,
  type ReadingStatus,
  type RichTextDocument,
  upgradeGoodreadsCoverUrl,
} from './bookDomain';

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

export function extractXmlTag(itemXml: string, tagName: string): string | null {
  const match = itemXml.match(
    new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
  );
  if (!match?.[1]) return null;
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  const text = (cdata?.[1] ?? decodeXmlEntities(raw)).trim();
  return text.length > 0 ? text : null;
}

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
}): { readDateFinished: string | null; readDateStarted: string | null; status: ReadingStatus } {
  const shelvesList = [shelf, ...(userShelves ? userShelves.split(',').map((s) => s.trim()) : [])]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const isReading = shelf === 'currently-reading' || shelvesList.includes('currently-reading');
  const isToRead =
    !isReading &&
    (shelf === 'to-read' || (shelvesList.includes('to-read') && !shelvesList.includes('read')));

  const finishedFromRead = parseGoodreadsDate(userReadAt);
  const finishedFromAdded =
    parseGoodreadsDate(userDateAdded) ?? parseGoodreadsDate(userDateCreated);
  const startedFromStarted = parseGoodreadsDate(userDateStarted);

  if (isToRead && !finishedFromRead) {
    return { readDateFinished: null, readDateStarted: null, status: 'notStarted' };
  }

  let readDateStarted = startedFromStarted ?? finishedFromAdded;
  let readDateFinished = finishedFromRead ?? (isReading ? null : finishedFromAdded);

  if (
    readDateFinished &&
    readDateStarted &&
    Date.parse(readDateFinished) < Date.parse(readDateStarted)
  ) {
    if (finishedFromRead !== null) readDateStarted = null;
    else readDateFinished = null;
  }

  const status: ReadingStatus =
    readDateFinished !== null ? 'read' : readDateStarted !== null ? 'reading' : 'notStarted';
  return { readDateFinished, readDateStarted, status };
}

export function parseGoodreadsRssXml(xml: string, shelf = 'read'): Array<GoodreadsBookItem> {
  if (!xml) return [];
  const items: Array<GoodreadsBookItem> = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const itemXml = match[1] ?? '';
    const rawTitle = extractXmlTag(itemXml, 'title');
    const rawAuthor = extractXmlTag(itemXml, 'author_name');
    if (!rawTitle || !rawAuthor) continue;

    const parsedRating = Number.parseInt(extractXmlTag(itemXml, 'user_rating') ?? '0', 10);
    const userShelves = extractXmlTag(itemXml, 'user_shelves');
    const rawReview = extractXmlTag(itemXml, 'user_review');
    const numPagesRaw = extractXmlTag(itemXml, 'num_pages');
    const dates = resolveReadDates({
      shelf,
      userDateAdded: extractXmlTag(itemXml, 'user_date_added'),
      userDateCreated:
        extractXmlTag(itemXml, 'user_date_created') ?? extractXmlTag(itemXml, 'pubDate'),
      userDateStarted: extractXmlTag(itemXml, 'user_date_started'),
      userReadAt: extractXmlTag(itemXml, 'user_read_at'),
      userShelves,
    });

    items.push({
      author: cleanWhitespace(rawAuthor),
      bookId: extractXmlTag(itemXml, 'book_id'),
      bookPublished: extractXmlTag(itemXml, 'book_published'),
      goodreadsCoverUrl:
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_large_image_url')) ??
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_medium_image_url')) ??
        upgradeGoodreadsCoverUrl(extractXmlTag(itemXml, 'book_image_url')),
      isbn:
        parseIsbn13Number(extractXmlTag(itemXml, 'isbn13')) ??
        parseIsbn13Number(extractXmlTag(itemXml, 'isbn')),
      numPages: numPagesRaw ? Number.parseInt(numPagesRaw, 10) || null : null,
      rating: Number.isInteger(parsedRating) && parsedRating > 0 ? parsedRating : null,
      readDateFinished: dates.readDateFinished,
      readDateStarted: dates.readDateStarted,
      reviewDescription: buildRichTextDocument(rawReview),
      reviewText: normalizeReviewText(rawReview) || null,
      shelf,
      status: dates.status,
      title: cleanWhitespace(rawTitle),
      userShelves: userShelves ?? shelf,
    });
  }
  return items;
}

export function mergeShelfBooks(
  shelfItemsList: ReadonlyArray<GoodreadsBookItem>,
): Array<GoodreadsBookItem> {
  const priority: Record<ReadingStatus, number> = { notStarted: 1, read: 3, reading: 2 };
  const merged: Array<GoodreadsBookItem> = [];

  for (const item of shelfItemsList) {
    const idx = merged.findIndex(
      (c) =>
        (item.bookId && c.bookId && item.bookId === c.bookId) ||
        (item.isbn && c.isbn && item.isbn === c.isbn) ||
        (normalizeAuthor(item.author) === normalizeAuthor(c.author) &&
          isDuplicateTitle(item.title, c.title)),
    );
    const existing = idx >= 0 ? merged[idx] : undefined;
    if (!existing) {
      merged.push(item);
      continue;
    }
    const [primary, secondary] =
      priority[item.status] > priority[existing.status] ? [item, existing] : [existing, item];
    merged[idx] = {
      ...secondary,
      ...primary,
      goodreadsCoverUrl: primary.goodreadsCoverUrl ?? secondary.goodreadsCoverUrl,
      isbn: primary.isbn ?? secondary.isbn,
      rating: primary.rating ?? secondary.rating,
      reviewDescription: primary.reviewDescription ?? secondary.reviewDescription,
      reviewText: primary.reviewText ?? secondary.reviewText,
    };
  }
  return merged;
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
  const params = new URLSearchParams({ per_page: String(perPage), shelf });
  if (rssKey) params.set('key', rssKey);
  return `https://www.goodreads.com/review/list_rss/${encodeURIComponent(userId)}?${params.toString()}`;
}
