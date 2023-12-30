import { gql } from 'graphql-request';
import { isNotNullish } from 'shared-core/helpers/typeguards';
import { contentfulClient } from './contentfulClient';
import { isLink } from './parsers';
import type { Link } from './api.generated';
import type { FooterQuery } from './fetchFooterLinks.generated';

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
export async function fetchFooterLinks(): Promise<Array<Link>> {
  const data = await contentfulClient.request<FooterQuery>(QUERY);
  const items =
    data.sectionCollection?.items.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  const links = items.filter(isLink).filter(isNotNullish);
  return links;
}
