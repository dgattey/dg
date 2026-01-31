import { gql } from 'graphql-request';
import { contentfulClient } from './contentfulClient';
import type { IntroBlockQuery } from './fetchIntroContent.generated';

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
                  sys {
                    id
                  }
                  title
                  url
                  icon
                }
              }
              block {
                ... on Link {
                  sys {
                    id
                  }
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
 * The return type of fetchIntroContent, exported for use in components.
 */
export type IntroContent = {
  textBlock: {
    content: NonNullable<
      NonNullable<IntroBlockQuery['textBlockCollection']>['items'][0]
    >['content'];
  };
  image: {
    url: string | undefined;
    width: number | undefined;
    height: number | undefined;
    title: string | undefined;
  };
};

/**
 * Fetches the text block corresponding to the introduction rich text
 * for the home page.
 */
export async function fetchIntroContent(): Promise<IntroContent | null> {
  const data = await contentfulClient.request<IntroBlockQuery>(QUERY);
  const textBlockItem = data.textBlockCollection?.items.filter((item) => item?.content?.json)[0];
  const image = data.asset;
  if (textBlockItem?.content && image) {
    return { image, textBlock: { content: textBlockItem.content } };
  }
  return null;
}
