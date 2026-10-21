import * as v from 'valibot';
import { assetSchema } from './shared';

/**
 * Schema for a Book entry returned by the Contentful GraphQL API.
 */
export const bookSchema = v.looseObject({
  author: v.optional(v.nullable(v.string())),
  isbn13: v.optional(v.nullable(v.number())),
  rating: v.optional(v.nullable(v.number())),
  readDateFinished: v.optional(v.nullable(v.string())),
  readingStatus: v.optional(v.nullable(v.string())),
  reviewDescription: v.optional(
    v.nullable(
      v.looseObject({
        json: v.unknown(),
      }),
    ),
  ),
  sys: v.optional(
    v.nullable(
      v.looseObject({
        id: v.string(),
      }),
    ),
  ),
  thumbnail: v.optional(v.nullable(assetSchema)),
  title: v.optional(v.nullable(v.string())),
});

/**
 * Schema for the GraphQL response wrapping a bookCollection query.
 */
export const booksResponseSchema = v.looseObject({
  bookCollection: v.nullable(
    v.looseObject({
      items: v.optional(v.nullable(v.array(v.nullable(bookSchema)))),
    }),
  ),
});

export type Book = v.InferOutput<typeof bookSchema>;
export type BooksResponse = v.InferOutput<typeof booksResponseSchema>;
