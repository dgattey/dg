import { isProject } from 'api/parsers';
import type { ProjectsQuery } from 'api/types/generated/fetchContentfulProjects.generated';
import { gql } from 'graphql-request';
import { contentfulClient } from './networkClients/contentfulClient';

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
          url
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
export const fetchContentfulProjects = async () => {
  const data = await contentfulClient.request<ProjectsQuery>(QUERY);
  return data?.projectCollection?.items.filter(isProject) ?? [];
};
