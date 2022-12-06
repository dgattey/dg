import { isTextBlock } from 'api/parsers';
import type { IntroBlockQuery } from 'api/types/generated/fetchContentfulIntroBlock.generated';
import { PROJECT_MAX_IMAGE_DIMENSION } from 'constants/imageSizes';
import { gql } from 'graphql-request';
import { contentfulClient } from './networkClients/contentfulClient';

// Account for pixel density
const IMAGE_SIZE = PROJECT_MAX_IMAGE_DIMENSION * 2;

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query IntroBlock {
    asset(id: "1P5peDFKfzDHjWd6mcytc8") {
      url(transform: {
        width: ${IMAGE_SIZE}
        height: ${IMAGE_SIZE}
        format: WEBP
      })
      width
      height
      title
    }
    textBlockCollection(limit: 1, where: { slug: "intro" }) {
      items {
        content {
          json
          links {
            entries {
              inline {
                ... on Link {
                  title
                  url
                  icon
                }
              }
              block {
                ... on Link {
                  title
                  url
                  icon
                }
              }
            }
            assets {
              block {
                sys {
                  id
                }
                url
                title
                width
                height
                description
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches the text block corresponding to the introduction rich text
 * for the home page.
 */
export const fetchContentfulIntroBlock = async () => {
  const data = await contentfulClient.request<IntroBlockQuery>(QUERY);
  const textBlock = data?.textBlockCollection?.items?.filter(isTextBlock)?.[0];
  const image = data?.asset;
  if (textBlock && image) {
    return { textBlock, image };
  }
  return null;
};
