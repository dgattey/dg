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
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!commitSha && !process.env.NODE_ENV) {
    // Fallback for browser only
    return undefined;
  }

  const data = await fetchGithubData<DgRepoLatestReleaseQuery>(QUERY);
  const releases = data?.repository?.releases?.nodes;
  const filteredReleases =
    releases?.filter((release) => release?.tagCommit?.oid === commitSha?.trim()) ?? [];
  // If we have a release that matched, return it, otherwise a fallback
  return filteredReleases[0]?.name ?? 'vX.Y.Z';
};

export default fetchRepoVersion;
