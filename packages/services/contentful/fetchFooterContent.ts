import 'server-only';

import type {
  FooterContent,
  FooterSectionKey,
} from '@dg/content-models/contentful/renderables/footer';
import {
  type RenderableLink,
  toRenderableLink,
} from '@dg/content-models/contentful/renderables/links';
import { toRenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import { footerLinksResponseSchema } from '@dg/content-models/contentful/schema/footer';
import type { LinkSection, TextBlock } from '@dg/content-models/contentful/schema/shared';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Grabs the contentful section with the slug of footer.
 * Note: blocksCollection limit is capped at 8 because Contentful's GraphQL
 * query complexity multiplies the limit by 1,000 when rich text `links` are
 * selected (8 * 1,000 + 8 * 10 = 8,081 <= 11,000 max cost).
 */
const QUERY = gql`
  query Footer {
    sectionCollection(limit: 1, where: { slug: "footer" }) {
      items {
        blocksCollection(limit: 8) {
          items {
            ... on TextBlock {
              title
              slug
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
            ... on Section {
              title
              slug
              blocksCollection(limit: 10) {
                items {
                  ... on Link {
                    title
                    url
                    icon
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

const isLinkSection = (item: unknown): item is LinkSection =>
  typeof item === 'object' && item !== null && 'blocksCollection' in item;

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
  let helloTitle: string | null = null;
  let elsewhereTitle: string | null = null;
  const links: Array<RenderableLink> = [];
  const sectionOrder: Array<FooterSectionKey> = [];

  const pushSection = (key: FooterSectionKey) => {
    if (!sectionOrder.includes(key)) {
      sectionOrder.push(key);
    }
  };

  for (const item of items) {
    if (!item) {
      continue;
    }
    if (isTextBlock(item)) {
      if (item.title?.trim()) {
        helloTitle ??= item.title.trim();
      }
      if (item.content) {
        description ??= toRenderableRichTextContent(item.content);
      }
      pushSection('hello');
      continue;
    }
    if (isLinkSection(item)) {
      if (item.title?.trim()) {
        elsewhereTitle ??= item.title.trim();
      }
      for (const nested of item.blocksCollection?.items ?? []) {
        const link = toRenderableLink(nested);
        if (isNotNullish(link)) {
          links.push(link);
        }
      }
      pushSection('elsewhere');
      continue;
    }
    const link = toRenderableLink(item);
    if (isNotNullish(link)) {
      links.push(link);
      if (link.icon === 'email' || link.url.startsWith('mailto:')) {
        pushSection('hello');
      } else {
        pushSection('elsewhere');
      }
    }
  }

  return {
    description,
    elsewhereTitle,
    helloTitle,
    links,
    sectionOrder: sectionOrder.length > 0 ? sectionOrder : ['hello', 'elsewhere'],
  };
}
