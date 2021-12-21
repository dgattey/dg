import { gql } from 'graphql-request';
import { Link, SiteFooterQuery } from '__generated__/contentful-api';
import fetchContentfulData from './fetchContentfulData';
import { isDefinedItem, isLink, isLinkCollection, isSection } from './typeguards';

interface SiteFooter {
  /**
   * An array of all the text links to show
   */
  textLinks: Array<Link>;

  /**
   * An array of all the icon links to show
   */
  iconLinks: Array<Link>;
}

/**
 * Grabs the contentful sections with the title of footer. Should
 * be only one.
 */
const QUERY = gql`
  query SiteFooter {
    sectionCollection(limit: 1, where: { title: "Footer" }) {
      items {
        blocksCollection(limit: 100) {
          items {
            ... on Link {
              title
              url
            }
            ... on Section {
              blocksCollection {
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
      }
    }
  }
`;

/**
 * Fetches all our site footer blocks from the Contentful API. Parses
 * out the text and icon links separately
 */
const fetchSiteFooter = async (): Promise<SiteFooter> => {
  const data = await fetchContentfulData<SiteFooterQuery>(QUERY);
  const items =
    data?.sectionCollection?.items.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];
  const iconLinks = items
    ?.filter(isSection)
    .flatMap((section) => section.blocksCollection)
    .filter(isLinkCollection)
    .flatMap((collection) => collection.items.filter(isDefinedItem) ?? []);
  return {
    textLinks: items.filter(isLink),
    iconLinks,
  };
};

export default fetchSiteFooter;
