import { gql } from 'graphql-request';
import type { Project } from './api.generated';
import { contentfulClient } from './contentfulClient';
import type { ProjectsQuery } from './fetchProjects.generated';
import { isProject } from './parsers';

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
export async function fetchProjects(): Promise<Array<Project>> {
  const data = await contentfulClient.request<ProjectsQuery>(QUERY);
  return data.projectCollection?.items.filter(isProject) ?? [];
}
