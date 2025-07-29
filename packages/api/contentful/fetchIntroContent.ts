import { gql } from 'graphql-request';
import type { TextBlock } from './api.generated';
import { contentfulClient } from './contentfulClient';
import type { IntroBlockQuery } from './fetchIntroContent.generated';
import { isTextBlock } from './parsers';

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query IntroBlock {
    asset(id: "1P5peDFKfzDHjWd6mcytc8") {
      url(
        transform: {
          width: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          height: 660 # PROJECT_MAX_IMAGE_DIMENSION * 2
          format: WEBP
        }
      )
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
export async function fetchIntroContent(): Promise<null | {
  textBlock: TextBlock;
  image: {
    url: string | undefined;
    width: number | undefined;
    height: number | undefined;
    title: string | undefined;
  };
}> {
  const data = await contentfulClient.request<IntroBlockQuery>(QUERY);
  const textBlock = data.textBlockCollection?.items.filter(isTextBlock)[0];
  const image = data.asset;
  if (textBlock && image) {
    return { image, textBlock };
  }
  return null;
}
