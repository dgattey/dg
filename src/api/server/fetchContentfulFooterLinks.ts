import { isDefinedItem, isLink } from 'api/parsers';
import type { FooterQuery } from 'api/types/generated/fetchContentfulFooterLinks.generated';
import { gql } from 'graphql-request';
import contentfulClient from './networkClients/contentfulClient';

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
 * Fetches all our site footer blocks from the Contentful API. Parses
 * out the text and icon links separately
 */
const fetchContentfulFooterLinks = async () => {
  const data = await contentfulClient.request<FooterQuery>(QUERY);
  const items =
    data?.sectionCollection?.items.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  const links = items.filter(isLink).filter(isDefinedItem);
  return links;
};

export default fetchContentfulFooterLinks;
