import {
  type RenderableLink,
  toRenderableLink,
} from '@dg/content-models/contentful/renderables/links';
import { linkSchema } from '@dg/content-models/contentful/schema/shared';
import { gql } from 'graphql-request';
import * as v from 'valibot';
import { parseResponse } from '../clients/parseResponse';
import { contentfulClient } from './contentfulClient';

const linkByNameResponseSchema = v.looseObject({
  linkCollection: v.nullable(
    v.looseObject({
      items: v.array(v.nullable(linkSchema)),
    }),
  ),
});

/**
 * Fetches a single link by name (partial match on title) directly from Contentful.
 * More efficient than fetching all links and filtering client-side.
 */
const QUERY = gql`
  query LinkByName($name: String!) {
    linkCollection(limit: 1, where: { title_contains: $name }) {
      items {
        title
        url
        icon
      }
    }
  }
`;

/**
 * Fetches a link by name directly from Contentful.
 * Returns null if no matching link is found.
 */
export async function fetchLinkByName(name: string): Promise<RenderableLink | null> {
  const data = parseResponse(
    linkByNameResponseSchema,
    await contentfulClient.request(QUERY, { name }),
    {
      kind: 'graphql',
      source: 'contentful.fetchLinkByName',
    },
  );
  const link = data.linkCollection?.items?.[0];
  return toRenderableLink(link);
}
