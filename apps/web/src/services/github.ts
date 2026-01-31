import 'server-only';

import { fetchRepoVersion } from '@dg/services/github/fetchRepoVersion';
import { cacheLife, cacheTag } from 'next/cache';

const VERSION_TAG = 'version';

export const getRepoVersion = async () => {
  'use cache';
  cacheLife('default');
  cacheTag(VERSION_TAG);

  const explicitVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  if (explicitVersion?.length) {
    return explicitVersion;
  }
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!process.env.GITHUB_AUTHENTICATION_TOKEN) {
    return commitSha?.slice(-12) ?? null;
  }
  return await fetchRepoVersion();
};
