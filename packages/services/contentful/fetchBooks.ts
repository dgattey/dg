import 'server-only';

import {
  type RenderableBook,
  toRenderableBook,
} from '@dg/content-models/contentful/renderables/books';
import { booksResponseSchema } from '@dg/content-models/contentful/schema/books';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

const PAGE_SIZE = 200;

/**
 * Queries read and currently-reading books from Contentful.
 * Excludes `notStarted` entries (`readDateFinished` and `readDateStarted` both null)
 * at the GraphQL layer so want-to-read entries do not consume page budget, and omits
 * `Book.isbn` because Contentful's GraphQL schema types `isbn` as a 32-bit `Int`
 * which overflows on 13-digit ISBN-13 values.
 */
const QUERY = gql`
  query Books($limit: Int!, $skip: Int!) {
    bookCollection(
      where: { OR: [{ readDateFinished_exists: true }, { readDateStarted_exists: true }] }
      order: [readDateFinished_DESC, readDateStarted_DESC, title_ASC]
      limit: $limit
      skip: $skip
    ) {
      total
      items {
        sys {
          id
        }
        title
        author
        rating
        readDateStarted
        readDateFinished
        reviewDescription {
          json
        }
        coverImage {
          url(transform: { quality: 90, format: WEBP })
          width
          height
        }
      }
    }
  }
`;

/**
 * Fetches all read and currently-reading books from Contentful, paginating across
 * 200-book pages if needed. Returns an empty array only when Contentful credentials
 * are absent; GraphQL and schema errors propagate directly.
 */
export async function fetchBooks(): Promise<Array<RenderableBook>> {
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
    return [];
  }

  const client = getContentfulClient();
  const books: Array<RenderableBook> = [];
  let skip = 0;

  while (true) {
    const data = parseResponse(
      booksResponseSchema,
      await client.request(QUERY, { limit: PAGE_SIZE, skip }),
      {
        kind: 'graphql',
        source: 'contentful.fetchBooks',
      },
    );
    const pageItems = data.bookCollection?.items ?? [];
    for (const item of pageItems) {
      const renderable = toRenderableBook(item);
      if (isNotNullish(renderable)) {
        books.push(renderable);
      }
    }
    skip += pageItems.length;
    const total = data.bookCollection?.total ?? 0;
    if (pageItems.length === 0 || skip >= total) {
      break;
    }
  }

  return books;
}
