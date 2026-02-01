import { toRenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { toRenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import { introBlockResponseSchema } from '@dg/content-models/contentful/schema/intro';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { contentfulClient } from './contentfulClient';

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

export type { IntroContent } from '@dg/content-models/contentful/renderables/intro';

/**
 * Fetches the text block corresponding to the introduction rich text
 * for the home page.
 */
export async function fetchIntroContent(): Promise<IntroContent | null> {
  const data = parseResponse(introBlockResponseSchema, await contentfulClient.request(QUERY), {
    kind: 'graphql',
    source: 'contentful.fetchIntroContent',
  });
  const textBlockItem = data.textBlockCollection?.items?.find((item) => item?.content?.json);
  const image = toRenderableAsset(data.asset);
  if (textBlockItem?.content && image) {
    return {
      image,
      textBlock: { content: toRenderableRichTextContent(textBlockItem.content) },
    };
  }
  return null;
}
