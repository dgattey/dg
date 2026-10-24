import 'server-only';

import {
  type RenderableProject,
  toRenderableProject,
} from '@dg/content-models/contentful/renderables/projects';
import { projectsResponseSchema } from '@dg/content-models/contentful/schema/projects';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

const QUERY = gql`
  query Projects {
    projectCollection(where: { isSideProject_not: true }, order: creationDate_DESC) {
      items {
        title
        creationDate
        type
        isSideProject
        link {
          url
        }
        layout
        thumbnail {
          url(transform: { width: 1520, quality: 85, format: WEBP })
          width
          height
        }
      }
    }
  }
`;

export async function fetchProjects(): Promise<Array<RenderableProject>> {
  const data = parseResponse(projectsResponseSchema, await getContentfulClient().request(QUERY), {
    kind: 'graphql',
    source: 'contentful.fetchProjects',
  });
  return (data.projectCollection?.items ?? [])
    .filter((project) => project?.isSideProject !== true)
    .map(toRenderableProject)
    .filter(isNotNullish);
}
