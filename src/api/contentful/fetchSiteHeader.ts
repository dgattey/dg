import { gql } from 'graphql-request';
import { Link as LinkType, SiteHeaderQuery } from '__generated__/contentful-api';
import fetchContentfulData from './fetchContentfulData';
import { isLink } from './typeguards';

type Link = Pick<LinkType, 'title' | 'url'>;

interface SiteHeader {
  /**
   * An array of text links to show
   */
  links: Array<Link>;
}

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query SiteHeader {
    sectionCollection(limit: 1, where: { title: "Header" }) {
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
  const data = await fetchContentfulData<SiteHeaderQuery>(QUERY);
  const links =
    data?.sectionCollection?.items?.flatMap(
      (item) => item?.blocksCollection?.items?.filter(isLink) ?? [],
    ) ?? [];
  return {
    links,
  };
};

export default fetchSiteHeader;
