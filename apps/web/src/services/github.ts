import 'server-only';

import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife } from 'next/cache';
import { getAppVersionInfo } from './version';

async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('hours');
  return await fetchReleases({ fallbackVersion: appVersion });
}

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  return await fetchCachedChangelogReleases(getAppVersionInfo().version);
}
