import { log } from '@logtail/next';
import { gql } from 'graphql-request';
import type { GithubRepoVersionQuery } from './fetchRepoVersion.generated';
import { githubClient } from './githubClient';

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
 * Locally, we inject `VERCEL_GIT_COMMIT_SHA` via `turbo dev` so it should work to
 * help us find the release when running locally. A production build locally won't
 * have either of these defined, so we'll just return `null`.
 */
export async function fetchRepoVersion(): Promise<string | null> {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  if (version?.length) {
    log.info(`Fetching version: using 'NEXT_PUBLIC_APP_VERSION': ${version}`, {
      version,
    });
    return version;
  }

  // Looks for a release that matches build-time `VERCEL_GIT_COMMIT_SHA` and compares it to each release's commit SHA
  // We disable a rule here otherwise the caching gets busted every time
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  log.info('Fetching version: no public app version, fetching releases', {
    commitSha,
  });
  const data = await githubClient.request<GithubRepoVersionQuery>(QUERY);
  const releases = data.repository?.releases.nodes;
  const filteredReleases =
    releases?.filter((release) => release?.tagCommit?.oid === commitSha?.trim()) ?? [];
  const foundRelease = filteredReleases[0]?.name;
  if (foundRelease) {
    log.info('Fetching version: found release', { foundRelease });
    return foundRelease;
  }

  log.info('Fetching version: no release, using commit SHA', { commitSha });
  return commitSha?.slice(-12) ?? null;
}
