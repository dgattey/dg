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

const NORMALIZED_FOOTER_DESCRIPTION =
  'Building from San Francisco. Always happy to connect about product, craft, and the outdoors.';

const FALLBACK_FOOTER_LINKS: Array<RenderableLink> = [
  { icon: 'cursor', title: 'Cursor', url: 'https://cursor.com/@dyl' },
  { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
  { icon: 'strava', title: 'Strava', url: 'https://www.strava.com/athletes/17469310' },
  {
    icon: 'spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com/user/dylangattey?si=yXvHMsSLR9au8bTjdjJsUA',
  },
  { icon: 'instagram', title: 'Instagram', url: 'https://www.instagram.com/dylangattey' },
  { icon: 'x', title: 'X', url: 'https://x.com/dyl_gat' },
  { icon: 'linkedin', title: 'LinkedIn', url: 'https://www.linkedin.com/in/dgattey' },
  { icon: 'email', title: 'Email me', url: 'mailto:dylan@gattey.com' },
];

function normalizeFooterDescription(
  description: FooterContent['description'],
): FooterContent['description'] {
  if (!description) {
    return null;
  }
  const normalizeNode = (node: Record<string, unknown>): Record<string, unknown> => {
    if (
      typeof node.value === 'string' &&
      (node.value.startsWith('Building from San Francisco') ||
        node.value.startsWith('Making software in San Francisco'))
    ) {
      return { ...node, value: NORMALIZED_FOOTER_DESCRIPTION };
    }
    if (Array.isArray(node.content)) {
      return {
        ...node,
        content: node.content.map((child) =>
          typeof child === 'object' && child !== null
            ? normalizeNode(child as Record<string, unknown>)
            : child,
        ),
      };
    }
    return node;
  };
  return {
    ...description,
    json: normalizeNode(
      description.json as unknown as Record<string, unknown>,
    ) as unknown as typeof description.json,
  };
}

/**
 * Fetches the footer description (TextBlock) and social/contact links from Contentful.
 */
export async function fetchFooterContent(): Promise<FooterContent> {
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
    return { description: null, links: FALLBACK_FOOTER_LINKS };
  }
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
        description ??= normalizeFooterDescription(toRenderableRichTextContent(item.content));
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
