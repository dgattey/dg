import { gql } from 'graphql-request';
import fetchGithubData from './fetchGithubData';
import { DgRepoLatestReleaseQuery } from './generated/fetchRepoVersion.generated';

const QUERY = gql`
  query DgRepoLatestRelease {
    repository(name: "dg", owner: "dgattey") {
      releases(last: 100) {
        nodes {
          name
          tagCommit {
            oid
          }
        }
      }
    }
  }
`;

/**
 * Grabs the last 100 versions from Github, and our HEAD commit SHA from
 * the filesystem. Compare the releases' `oid`s to the current HEAD to
 * see which one matches. If any do, the first is returned. Won't be able
 * to run on client, but it'll gracefully fallback to the fallback.
 */
const fetchRepoVersion = async () => {
  const data = await fetchGithubData<DgRepoLatestReleaseQuery>(QUERY);
  const releases = data?.repository?.releases?.nodes;
  try {
    const { promisify } = await import('util');
    const exec = promisify((await import('child_process')).exec);
    const { stdout: commitSha } = await exec('git rev-parse HEAD');
    const filteredReleases =
      releases?.filter((release) => release?.tagCommit?.oid === commitSha.trim()) ?? [];
    return filteredReleases[0]?.name ?? null;
  } catch {
    return undefined;
  }
};

export default fetchRepoVersion;
