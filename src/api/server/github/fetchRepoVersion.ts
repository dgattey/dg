import type { GithubRepoVersionQuery } from 'api/types/generated/fetchRepoVersion.generated';
import { gql } from 'graphql-request';
import { githubClient } from '../networkClients/githubClient';

/**
 * This, strictly speaking, is usually overkill. We fetch the 100 most recently
 * created releases from Github for use in later parsing to a version tag.
 */
const QUERY = gql`
  query GithubRepoVersion {
    repository(name: "dg", owner: "dgattey") {
      releases(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
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
 * If `NEXT_PUBLIC_APP_VERSION` is defined, we use it as our version string.
 * Otherwise, looks for a release whose git `oid` matches build-time-defined
 * `VERCEL_GIT_COMMIT_SHA`. Falls back to the commit SHA itself if no release
 * is found.
 *
 * On Vercel, `VERCEL_GIT_COMMIT_SHA` is defined always, and `NEXT_PUBLIC_APP_VERSION`
 * is defined from our `release.yml` script, so we should only see commit SHA before
 * our release workflow runs (~2 min after a commit is pushed to `main`).
 *
 * Locally, we inject `VERCEL_GIT_COMMIT_SHA` via `pnpm dev` so it should work to
 * help us find the release when running locally. A production build locally won't
 * have either of these defined, so we'll just return `null`.
 */
export async function fetchRepoVersion(): Promise<string | null> {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  if (version?.length) {
    return version;
  }

  // Looks for a release that matches build-time `VERCEL_GIT_COMMIT_SHA` and compares it to each release's commit SHA
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const data = await githubClient.request<GithubRepoVersionQuery>(QUERY);
  const releases = data?.repository?.releases?.nodes;
  const filteredReleases =
    releases?.filter((release) => release?.tagCommit?.oid === commitSha?.trim()) ?? [];
  return filteredReleases[0]?.name ?? commitSha?.slice(-12) ?? null;
}
