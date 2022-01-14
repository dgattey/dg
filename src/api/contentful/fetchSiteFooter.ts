import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import { Link } from './generated/api.generated';
import { SiteFooterQuery } from './generated/fetchSiteFooter.generated';
import { isDefinedItem, isLink } from './typeguards';

type SiteFooter = Array<Link>;

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
 * Fetches all our site footer blocks from the Contentful API. Parses
 * out the text and icon links separately
 */
const fetchSiteFooter = async (): Promise<SiteFooter> => {
  const data = await fetchGraphQLData<SiteFooterQuery>('/api/content', QUERY);
  const items =
    data?.sectionCollection?.items.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  return items.filter(isLink).filter(isDefinedItem);
};

export default fetchSiteFooter;
