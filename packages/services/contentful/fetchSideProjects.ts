import 'server-only';

import {
  SIDE_PROJECTS_LIMIT,
  type RenderableSideProject,
  takeNewestSideProjects,
  toRenderableSideProject,
} from '@dg/content-models/contentful/renderables/sideProjects';
import { sideProjectsResponseSchema } from '@dg/content-models/contentful/schema/sideProjects';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Newest published side projects for the homepage card.
 * Contentful orders by explicit publishedAt; we still re-sort and cap locally.
 */
const QUERY = gql`
  query SideProjects {
    sideProjectCollection(limit: 2, order: publishedAt_DESC) {
      items {
        title
        description
        url
        publishedAt
        mark {
          url(transform: { quality: 90, format: WEBP, width: 80, height: 80 })
          width
          height
          title
        }
      }
    }
  }
`;

/**
 * Fetches at most the two newest published side projects.
 */
export async function fetchSideProjects(): Promise<Array<RenderableSideProject>> {
  const data = parseResponse(
    sideProjectsResponseSchema,
    await getContentfulClient().request(QUERY),
    {
      kind: 'graphql',
      source: 'contentful.fetchSideProjects',
    },
  );
  const projects = (data.sideProjectCollection?.items ?? [])
    .map(toRenderableSideProject)
    .filter(isNotNullish);
  return takeNewestSideProjects(projects, SIDE_PROJECTS_LIMIT);
}
