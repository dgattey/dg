import * as v from 'valibot';
import { assetSchema } from './shared';

const richTextJsonSchema = v.looseObject({
  json: v.unknown(),
});

/**
 * Schema for a Book entry returned by the Contentful GraphQL API.
 */
const bookSchema = v.looseObject({
  author: v.optional(v.nullable(v.string())),
  coverImage: v.optional(v.nullable(assetSchema)),
  isbn: v.optional(v.nullable(v.number())),
  notes: v.optional(v.nullable(richTextJsonSchema)),
  rating: v.optional(v.nullable(v.number())),
  readDateFinished: v.optional(v.nullable(v.string())),
  readDateStarted: v.optional(v.nullable(v.string())),
  reviewDescription: v.optional(v.nullable(richTextJsonSchema)),
  sys: v.optional(
    v.nullable(
      v.looseObject({
        id: v.string(),
      }),
    ),
  ),
  title: v.optional(v.nullable(v.string())),
});

/**
 * Schema for the GraphQL response wrapping a bookCollection query.
 */
export const booksResponseSchema = v.looseObject({
  bookCollection: v.nullable(
    v.looseObject({
      items: v.optional(v.nullable(v.array(v.nullable(bookSchema)))),
      total: v.optional(v.nullable(v.number())),
    }),
  ),
});

export type Book = v.InferOutput<typeof bookSchema>;
