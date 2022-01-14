import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import { Asset, TextBlock } from './generated/api.generated';
import { IntroBlockQuery } from './generated/fetchIntroBlock.generated';
import { isTextBlock } from './typeguards';

type IntroBlock = {
  textBlock: TextBlock;
  image: Pick<Asset, 'url' | 'width' | 'height' | 'title'>;
} | null;

/**
 * Grabs the contentful sections with the title of header. Should
 * be only one.
 */
const QUERY = gql`
  query IntroBlock {
    asset(id: "1P5peDFKfzDHjWd6mcytc8") {
      url
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
const fetchIntroBlock = async (): Promise<IntroBlock> => {
  const data = await fetchGraphQLData<IntroBlockQuery>('/api/content', QUERY);
  const textBlock = data?.textBlockCollection?.items?.filter(isTextBlock)?.[0];
  const image = data?.asset;
  if (textBlock && image) {
    return { textBlock, image };
  }
  return null;
};

export default fetchIntroBlock;
