import { gql } from 'graphql-request';
import fetchGraphQLData from '../fetchGraphQLData';
import { Project } from './generated/api.generated';
import { ProjectsQuery } from './generated/fetchProjects.generated';
import { isProject } from './typeguards';

type Projects = Array<Project>;

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
 * Fetches the section corresponding to the projects and finds the nodes within it
 * to transform into Projects
 */
const fetchProjects = async (): Promise<Projects> => {
  const data = await fetchGraphQLData<ProjectsQuery>('/api/content', QUERY);
  return data?.projectCollection?.items.filter(isProject) ?? [];
};

export default fetchProjects;
