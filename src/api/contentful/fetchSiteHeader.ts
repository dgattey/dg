import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import { Link } from './generated/api.generated';
import { SiteHeaderQuery } from './generated/fetchSiteHeader.generated';
import { isLink } from './typeguards';

type SiteHeader = Array<Link>;

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query SiteHeader {
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
const fetchSiteHeader = async (): Promise<SiteHeader> => {
  const data = await fetchGraphQLData<SiteHeaderQuery>('/api/content', QUERY);
  return (
    data?.sectionCollection?.items?.flatMap(
      (item) => item?.blocksCollection?.items?.filter(isLink) ?? [],
    ) ?? []
  );
};

export default fetchSiteHeader;
