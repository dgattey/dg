import { gql } from 'graphql-request';
import { contentfulClient } from './contentfulClient';
import { isTextBlock } from './parsers';
import type { TextBlock } from './api.generated';
import type { PrivacyBlockQuery } from './fetchPrivacyContent.generated';

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
                url(transform: { width: 640, height: 640, format: WEBP })
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
export async function fetchPrivacyContent(): Promise<TextBlock | null> {
  const data = await contentfulClient.request<PrivacyBlockQuery>(QUERY);
  return data.textBlockCollection?.items.filter(isTextBlock)?.[0] ?? null;
}
