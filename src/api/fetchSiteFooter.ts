import { gql } from 'graphql-request';
import fetchContentfulData from './fetchContentfulData';

type Link = {
  title: string;
  url: string;
};

type IconLink = Link & {
  icon: string;
};

type IconSection = {
  blocksCollection: {
    items: Array<IconLink>;
  };
};

/**
 * Defines the contents of the site footer
 */
type RawSiteFooter = {
  sectionCollection: {
    items: Array<{
      blocksCollection: {
        items: Array<Link | IconSection>;
      };
    }>;
  };
};

interface SiteFooter {
  /**
   * An array of all the text links to show
   */
  textLinks: Array<Link>;

  /**
   * An array of all the icon links to show
   */
  iconLinks: Array<IconLink>;
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
 * Type guard to get icon sections out of a link or icon section
 */
const isIconSection = (item: Link | IconSection): item is IconSection =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as IconSection)?.blocksCollection?.items;

/**
 * Type guard to get text links out of a link or icon section
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const isTextLink = (item: Link | IconSection): item is Link => !!(item as Link)?.title;

/**
 * Fetches all our site footer blocks from the Contentful API. Parses
 * out the text and icon links separately
 */
const fetchSiteFooter = async (): Promise<SiteFooter> => {
  const data = await fetchContentfulData<RawSiteFooter>(QUERY);
  const items =
    data?.sectionCollection.items.flatMap((item) => item.blocksCollection.items ?? []) ?? [];
  const iconLinks = items
    .filter(isIconSection)
    .flatMap((section) => section.blocksCollection.items);
  return {
    textLinks: items.filter(isTextLink),
    iconLinks,
  };
};

export default fetchSiteFooter;
