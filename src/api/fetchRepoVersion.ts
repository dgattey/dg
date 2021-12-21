import { gql } from 'graphql-request';
import fetchGithubData from './fetchGithubData';

type LatestRelease = {
  repository: {
    latestRelease: {
      name: string;
    };
  };
};

const QUERY = gql`
  query DgRepoLatestRelease {
    repository(name: "dg", owner: "dgattey") {
      latestRelease {
        name
      }
    }
  }
`;

/**
 * Grabs latest version of the repo from Github
 */
const fetchRepoVersion = async () => {
  const data = await fetchGithubData<LatestRelease>(QUERY);
  return data?.repository.latestRelease.name;
};

export default fetchRepoVersion;
