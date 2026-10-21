import 'server-only';

import { FALLBACK_BOOKS } from '@dg/content-models/books/fallbackBooks';
import {
  type RenderableBook,
  toRenderableBook,
} from '@dg/content-models/contentful/renderables/books';
import { booksResponseSchema } from '@dg/content-models/contentful/schema/books';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

const QUERY = gql`
  query Books {
    bookCollection(order: [readDateFinished_DESC, title_ASC], limit: 200) {
      items {
        sys {
          id
        }
        title
        author
        rating
        readDateFinished
        readingStatus
        reviewDescription {
          json
        }
        thumbnail {
          url(transform: { quality: 90, format: WEBP })
          width
          height
        }
      }
    }
  }
`;

/**
 * Fetches books sorted by finished date descending from Contentful.
 * Falls back to the curated Goodreads dataset when Contentful credentials
 * are absent or bookCollection returns empty.
 */
export async function fetchBooks(): Promise<Array<RenderableBook>> {
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
    return [...FALLBACK_BOOKS];
  }

  try {
    const data = parseResponse(booksResponseSchema, await getContentfulClient().request(QUERY), {
      kind: 'graphql',
      source: 'contentful.fetchBooks',
    });
    const books = (data.bookCollection?.items ?? []).map(toRenderableBook).filter(isNotNullish);
    return books.length > 0 ? books : [...FALLBACK_BOOKS];
  } catch {
    return [...FALLBACK_BOOKS];
  }
}
