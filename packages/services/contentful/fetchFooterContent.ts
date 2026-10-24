import 'server-only';

import type { FooterContent } from '@dg/content-models/contentful/renderables/footer';
import {
  type RenderableLink,
  toRenderableLink,
} from '@dg/content-models/contentful/renderables/links';
import { toRenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import { footerLinksResponseSchema } from '@dg/content-models/contentful/schema/footer';
import type { TextBlock } from '@dg/content-models/contentful/schema/shared';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Grabs the contentful section with the slug of footer.
 * Note: blocksCollection limit is capped at 10 because Contentful's GraphQL
 * query complexity multiplies the limit by 1,000 when rich text `links` are
 * selected (10 * 1,000 = 10,011 <= 11,000 max cost).
 */
const QUERY = gql`
  query Footer {
    sectionCollection(limit: 1, where: { slug: "footer" }) {
      items {
        blocksCollection(limit: 10) {
          items {
            ... on TextBlock {
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
                    }
                  }
                }
              }
            }
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
`;

const isTextBlock = (item: unknown): item is TextBlock =>
  typeof item === 'object' && item !== null && 'content' in item;

export async function fetchFooterContent(): Promise<FooterContent> {
  const data = parseResponse(
    footerLinksResponseSchema,
    await getContentfulClient().request(QUERY),
    {
      kind: 'graphql',
      source: 'contentful.fetchFooterContent',
    },
  );
  const items =
    data.sectionCollection?.items?.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];

  let description: FooterContent['description'] = null;
  const links: Array<RenderableLink> = [];

  for (const item of items) {
    if (!item) {
      continue;
    }
    if (isTextBlock(item)) {
      if (item.content) {
        description ??= toRenderableRichTextContent(item.content);
      }
      continue;
    }
    const link = toRenderableLink(item);
    if (isNotNullish(link)) {
      links.push(link);
    }
  }

  return { description, links };
}
