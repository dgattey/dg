import 'server-only';

import {
  type RenderableLink,
  toRenderableLink,
} from '@dg/content-models/contentful/renderables/links';
import { footerLinksResponseSchema } from '@dg/content-models/contentful/schema/footer';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { contentfulClient } from './contentfulClient';

/**
 * Grabs the contentful sections with the title of footer. Should
 * be only one.
 */
const QUERY = gql`
  query Footer {
    sectionCollection(limit: 1, where: { slug: "footer" }) {
      items {
        blocksCollection(limit: 100) {
          items {
            ... on Link {
              title
              url
              icon
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches all our site footer blocks from the Contentful API.
 */
export async function fetchFooterLinks(): Promise<Array<RenderableLink>> {
  const data = parseResponse(footerLinksResponseSchema, await contentfulClient.request(QUERY), {
    kind: 'graphql',
    source: 'contentful.fetchFooterLinks',
  });
  const items =
    data.sectionCollection?.items?.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  return items.map(toRenderableLink).filter(isNotNullish);
}
