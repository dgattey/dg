import { isTextBlock } from '@dg/api/parsers';
import type { PrivacyBlockQuery } from '@dg/api/types/generated/fetchContentfulPrivacyBlock.generated';
import { gql } from 'graphql-request';
import contentfulClient from './networkClients/contentfulClient';

/**
 * Grabs the Contentful text block for the privacy page - should be
 * just one.
 */
const QUERY = gql`
  query PrivacyBlock {
    textBlockCollection(limit: 1, where: { slug: "privacy" }) {
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
 * Fetches the text block corresponding to the privacy rich text
 * for the privacy page.
 */
const fetchContentfulPrivacyBlock = async () => {
  const data = await contentfulClient.request<PrivacyBlockQuery>(QUERY);
  return data?.textBlockCollection?.items?.filter(isTextBlock)?.[0];
};

export default fetchContentfulPrivacyBlock;
