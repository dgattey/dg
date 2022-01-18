import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import { SiteFooterQuery } from './generated/fetchSiteFooter.generated';
import { isDefinedItem, isLink } from './typeguards';

/**
 * Grabs the contentful sections with the title of footer. Should
 * be only one.
 */
const QUERY = gql`
  query SiteFooter {
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
 * Filters footer links by a name contained in the title, if present
 */
export const linkWithName = (
  links: Awaited<ReturnType<typeof fetchSiteFooter>> | undefined,
  name: string,
) => links?.find((item) => item.title?.includes(name));

/**
 * Fetches all our site footer blocks from the Contentful API. Parses
 * out the text and icon links separately
 */
const fetchSiteFooter = async () => {
  const data = await fetchGraphQLData<SiteFooterQuery>('/api/content', QUERY);
  const items =
    data?.sectionCollection?.items.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  const links = items.filter(isLink).filter(isDefinedItem);
  return links;
};

export default fetchSiteFooter;
