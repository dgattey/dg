import { isProject } from 'api/parsers';
import { Project } from 'api/types/generated/contentfulApi.generated';
import type { ProjectsQuery } from 'api/types/generated/fetchProjects.generated';
import { gql } from 'graphql-request';
import { contentfulClient } from '../networkClients/contentfulClient';

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
  return data?.projectCollection?.items.filter(isProject) ?? [];
}
