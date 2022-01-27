import { isLink } from 'api/parsers';
import type { HeaderQuery } from 'api/types/generated/fetchContentfulHeaderLinks.generated';
import { gql } from 'graphql-request';
import contentfulClient from './contentfulClient';

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query Header {
    sectionCollection(limit: 1, where: { slug: "header" }) {
      items {
        blocksCollection(limit: 100) {
          items {
            ... on Link {
              title
              url
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches the section corresponding to the header and finds the nodes within it
 * to transform into links
 */
const fetchContentfulHeaderLinks = async () => {
  const data = await contentfulClient.request<HeaderQuery>(QUERY);
  return (
    data?.sectionCollection?.items?.flatMap(
      (item) => item?.blocksCollection?.items?.filter(isLink) ?? [],
    ) ?? []
  );
};

export default fetchContentfulHeaderLinks;
