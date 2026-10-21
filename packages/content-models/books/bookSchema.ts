import * as v from 'valibot';
import {
  ALLOWED_COVER_IMAGE_CONTENT_TYPES,
  ALLOWED_COVER_IMAGE_HOSTS,
  type CoverImageContentType,
  cleanWhitespace,
  decodeCoverImageBase64,
  isAllowedCoverImageUrl,
  isValidContentfulEntityId,
  MAX_BOOK_AUTHOR_LENGTH,
  MAX_BOOK_ID_LENGTH,
  MAX_BOOK_NOTES_LENGTH,
  MAX_BOOK_RATING,
  MAX_BOOK_REVIEW_LENGTH,
  MAX_BOOK_TITLE_LENGTH,
  MAX_SYNC_BATCH_SIZE,
  MIN_BOOK_RATING,
  parseGoodreadsDate,
  parseIsbn13Number,
} from './bookDomain';

export type BookMutationInput = {
  author?: string | null;
  coverAssetId?: string | null;
  coverImageBase64?: string | null;
  coverImageContentType?: CoverImageContentType | null;
  coverImageUrl?: string | null;
  id?: string | null;
  isbn?: number | null;
  notesPlainText?: string | null;
  rating?: number | null;
  readDateFinished?: string | null;
  readDateStarted?: string | null;
  reviewPlainText?: string | null;
  title: string;
};

export type ValidatedBooksSyncPayload = {
  booksToUpsert: Array<BookMutationInput>;
  deletedIdsToProcess: Array<string>;
};

const idErr = `Entity ID must be 1-${MAX_BOOK_ID_LENGTH} alphanumeric, underscore, or hyphen characters`;
const ratingErr = `Book rating must be an integer between ${MIN_BOOK_RATING} and ${MAX_BOOK_RATING}`;
const hostErr = `Book coverImageUrl must be an HTTPS URL from an allowed cover host (${ALLOWED_COVER_IMAGE_HOSTS.join(', ')})`;
const contentTypeErr = `Book coverImageContentType must be one of: ${ALLOWED_COVER_IMAGE_CONTENT_TYPES.join(', ')}`;
const coverPairErr =
  'Book coverImageBase64 and coverImageContentType must both be provided together';

const entityIdSchema = v.pipe(
  v.string('Entity ID must be a string'),
  v.transform((s) => s.trim()),
  v.check((s) => isValidContentfulEntityId(s), idErr),
);
const optNull = <TInput, TOutput, TIssue extends v.BaseIssue<unknown>>(
  schema: v.BaseSchema<TInput, TOutput, TIssue>,
) => v.optional(v.nullable(schema));
const optStr = <T>(
  name: string,
  checkFn: (s: string) => boolean,
  cErr: string,
  mapFn: (s: string) => T,
) =>
  optNull(
    v.pipe(
      v.string(`Book ${name} must be a string`),
      v.check((s) => s.trim() === '' || checkFn(s), cErr),
      v.transform((s) => (s.trim() === '' ? null : mapFn(s.trim()))),
    ),
  );
const optId = (name: string, err: string) => optStr(name, isValidContentfulEntityId, err, (s) => s);
const isoDate = (name: string) =>
  optStr(
    name,
    (s) => parseGoodreadsDate(s) !== null,
    `Book ${name} is not a valid date`,
    parseGoodreadsDate,
  );
const maxStr = (name: string, max: number, norm = false) =>
  optNull(
    v.pipe(
      v.string(`Book ${name} must be a string`),
      v.transform((s) => (norm ? cleanWhitespace(s) : s)),
      v.maxLength(max, `Book ${name} exceeds maximum length of ${max} characters`),
    ),
  );
const maxArr = <TInput, TOutput, TIssue extends v.BaseIssue<unknown>>(
  item: v.BaseSchema<TInput, TOutput, TIssue>,
  name: string,
  desc: string,
) =>
  optNull(
    v.pipe(
      v.array(item, `${name} must be an array of ${desc}`),
      v.maxLength(
        MAX_SYNC_BATCH_SIZE,
        `${name} exceeds maximum batch size of ${MAX_SYNC_BATCH_SIZE}`,
      ),
    ),
  );
const ratingSchema = v.pipe(
  v.number(ratingErr),
  v.integer(ratingErr),
  v.minValue(MIN_BOOK_RATING, ratingErr),
  v.maxValue(MAX_BOOK_RATING, ratingErr),
);
const isbnSchema = v.pipe(
  v.union([v.string(), v.number()], 'Book isbn must be a string or number'),
  v.check(
    (x) => x === '' || parseIsbn13Number(x) !== null,
    'Book isbn must be a valid ISBN-10 or ISBN-13',
  ),
  v.transform((x) => (x === '' ? null : parseIsbn13Number(x))),
);
const titleSchema = v.pipe(
  v.string('Book title is required and must be a string'),
  v.transform((s) => cleanWhitespace(s)),
  v.nonEmpty('Book title cannot be empty'),
  v.maxLength(
    MAX_BOOK_TITLE_LENGTH,
    `Book title exceeds maximum length of ${MAX_BOOK_TITLE_LENGTH} characters`,
  ),
);

const coverImageBase64Schema = v.pipe(
  v.string('Book coverImageBase64 must be a string'),
  v.rawCheck(({ addIssue, dataset }) => {
    if (dataset.typed) {
      const decoded = decodeCoverImageBase64(dataset.value);
      if (!decoded.ok) addIssue({ message: decoded.error });
    }
  }),
);
const coverImageContentTypeSchema = v.picklist(ALLOWED_COVER_IMAGE_CONTENT_TYPES, contentTypeErr);

export const bookMutationInputSchema = v.pipe(
  v.looseObject(
    {
      author: maxStr('author', MAX_BOOK_AUTHOR_LENGTH, true),
      coverAssetId: optId('coverAssetId', 'Book coverAssetId must be a valid Contentful asset ID'),
      coverImageBase64: optNull(coverImageBase64Schema),
      coverImageContentType: optNull(coverImageContentTypeSchema),
      coverImageUrl: optStr('coverImageUrl', isAllowedCoverImageUrl, hostErr, (s) => s),
      id: optId('id', idErr.replace('Entity ID', 'Book id')),
      isbn: optNull(isbnSchema),
      notesPlainText: maxStr('notesPlainText', MAX_BOOK_NOTES_LENGTH),
      rating: optNull(ratingSchema),
      readDateFinished: isoDate('readDateFinished'),
      readDateStarted: isoDate('readDateStarted'),
      reviewPlainText: maxStr('reviewPlainText', MAX_BOOK_REVIEW_LENGTH),
      title: titleSchema,
    },
    'Each book entry must be a JSON object',
  ),
  v.check((b) => Boolean(b.coverImageBase64) === Boolean(b.coverImageContentType), coverPairErr),
);

export const validateBookMutationInput = (
  raw: unknown,
): { book: BookMutationInput; ok: true } | { error: string; ok: false } => {
  const parsed = v.safeParse(bookMutationInputSchema, raw);
  return parsed.success
    ? { book: parsed.output, ok: true }
    : { error: parsed.issues[0].message, ok: false };
};

const syncEnvelopeSchema = v.looseObject(
  {
    deleteIds: maxArr(entityIdSchema, 'deleteIds', 'strings'),
    upserts: maxArr(v.unknown(), 'upserts', 'book objects'),
  },
  'Request body must be a JSON object',
);

export function validateBooksSyncPayload(
  payload: unknown,
): { data: ValidatedBooksSyncPayload; ok: true } | { error: string; ok: false } {
  const env = v.safeParse(syncEnvelopeSchema, payload);
  if (!env.success) return { error: env.issues[0].message, ok: false };
  const deletedIdsToProcess = [...new Set(env.output.deleteIds ?? [])];
  const rawBooks = env.output.upserts ?? [];
  if (deletedIdsToProcess.length + rawBooks.length > MAX_SYNC_BATCH_SIZE) {
    return {
      error: `Total operations in a single request cannot exceed ${MAX_SYNC_BATCH_SIZE}`,
      ok: false,
    };
  }
  const booksToUpsert: Array<BookMutationInput> = [];
  for (const rawBook of rawBooks) {
    const res = validateBookMutationInput(rawBook);
    if (!res.ok) return res;
    booksToUpsert.push(res.book);
  }
  return deletedIdsToProcess.length === 0 && booksToUpsert.length === 0
    ? { error: 'Request must include at least one book in upserts or id in deleteIds', ok: false }
    : { data: { booksToUpsert, deletedIdsToProcess }, ok: true };
}
