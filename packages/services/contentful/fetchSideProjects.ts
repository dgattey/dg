import 'server-only';

import {
  type RenderableSideProject,
  SIDE_PROJECTS_LIMIT,
  takeNewestSideProjects,
  toRenderableSideProject,
} from '@dg/content-models/contentful/renderables/sideProjects';
import { projectsResponseSchema } from '@dg/content-models/contentful/schema/projects';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Newest flagged side projects for the homepage card.
 * Uses project.isSideProject and creationDate (same recency as the grid).
 */
const QUERY = gql`
  query SideProjects {
    projectCollection(limit: 2, where: { isSideProject: true }, order: creationDate_DESC) {
      items {
        title
        summary
        creationDate
        isSideProject
        link {
          url
        }
        thumbnail {
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
 * Fetches at most the two newest published side projects (flagged projects).
 */
export async function fetchSideProjects(): Promise<Array<RenderableSideProject>> {
  const data = parseResponse(projectsResponseSchema, await getContentfulClient().request(QUERY), {
    kind: 'graphql',
    source: 'contentful.fetchSideProjects',
  });
  const projects = (data.projectCollection?.items ?? [])
    .map(toRenderableSideProject)
    .filter(isNotNullish);
  return takeNewestSideProjects(projects, SIDE_PROJECTS_LIMIT);
}
