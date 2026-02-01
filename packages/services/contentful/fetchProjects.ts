import {
  type RenderableProject,
  toRenderableProject,
} from '@dg/content-models/contentful/renderables/projects';
import { projectsResponseSchema } from '@dg/content-models/contentful/schema/projects';
import { isNotNullish } from '@dg/shared-core/helpers/typeguards';
import { gql } from 'graphql-request';
import { parseResponse } from '../clients/parseResponse';
import { contentfulClient } from './contentfulClient';

/**
 * Grabs all projects to display
 */
const QUERY = gql`
  query Projects {
    projectCollection(order: creationDate_DESC) {
      items {
        title
        creationDate
        type
        link {
          url
        }
        layout
        thumbnail {
          url(transform: { quality: 90, format: WEBP })
          width
          height
        }
        description {
          json
        }
      }
    }
  }
`;

/**
 * Fetches all projects sorted by newest first.
 */
export async function fetchProjects(): Promise<Array<RenderableProject>> {
  const data = parseResponse(projectsResponseSchema, await contentfulClient.request(QUERY), {
    kind: 'graphql',
    source: 'contentful.fetchProjects',
  });
  return (data.projectCollection?.items ?? []).map(toRenderableProject).filter(isNotNullish);
}
