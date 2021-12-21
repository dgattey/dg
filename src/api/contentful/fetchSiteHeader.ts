import { gql } from 'graphql-request';
import fetchContentfulData from './fetchContentfulData';

type Link = {
  title: string;
  url: string;
};

type RawSiteHeader = {
  sectionCollection: {
    items: Array<{
      blocksCollection: {
        items: Array<Link>;
      };
    }>;
  };
};

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
  const data = await fetchContentfulData<RawSiteHeader>(QUERY);
  const links =
    data?.sectionCollection.items.flatMap((item) => item.blocksCollection.items ?? []) ?? [];
  return {
    links,
  };
};

export default fetchSiteHeader;
