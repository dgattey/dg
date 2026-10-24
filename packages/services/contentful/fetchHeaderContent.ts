import 'server-only';

import type {
  HeaderContent,
  HeaderNavItem,
} from '@dg/content-models/contentful/renderables/footer';
import { toRenderableLink } from '@dg/content-models/contentful/renderables/links';
import { headerSectionResponseSchema } from '@dg/content-models/contentful/schema/footer';
import type { LinkSection } from '@dg/content-models/contentful/schema/shared';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Grabs the Contentful section with the slug of `header`.
 */
const QUERY = gql`
  query Header {
    sectionCollection(limit: 1, where: { slug: "header" }) {
      items {
        blocksCollection(limit: 10) {
          items {
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

const isLinkSection = (item: unknown): item is LinkSection =>
  typeof item === 'object' && item !== null && 'blocksCollection' in item;

export async function fetchHeaderContent(): Promise<HeaderContent> {
  const data = parseResponse(
    headerSectionResponseSchema,
    await getContentfulClient().request(QUERY),
    {
      kind: 'graphql',
      source: 'contentful.fetchHeaderContent',
    },
  );
  const blocks =
    data.sectionCollection?.items?.flatMap((item) => item?.blocksCollection?.items ?? []) ?? [];

  const items: Array<HeaderNavItem> = [];
  for (const block of blocks) {
    if (!block) {
      continue;
    }
    if (isLinkSection(block)) {
      const title = block.title?.trim();
      const links = (block.blocksCollection?.items ?? [])
        .map(toRenderableLink)
        .filter(isNotNullish);
      if (title && links.length > 0) {
        items.push({
          kind: 'menu',
          links,
          slug: block.slug?.trim() ?? null,
          title,
        });
      }
      continue;
    }
    const link = toRenderableLink(block);
    if (isNotNullish(link)) {
      items.push({
        kind: 'link',
        link,
      });
    }
  }

  return { items };
}
