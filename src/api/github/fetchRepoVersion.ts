import { gql } from 'graphql-request';
import { DgRepoLatestReleaseQuery } from '__generated__/github-api';
import fetchGithubData from './fetchGithubData';

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
  const data = await fetchGithubData<DgRepoLatestReleaseQuery>(QUERY);
  return data?.repository?.latestRelease?.name ?? null;
};

export default fetchRepoVersion;
