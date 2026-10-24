import 'server-only';

import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife, cacheTag } from 'next/cache';
import { getAppVersionInfo } from './version';

const CHANGELOG_TAG = 'changelog';

async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('max');
  cacheTag(CHANGELOG_TAG);
  return await fetchReleases({ fallbackVersion: appVersion });
}

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  return await fetchCachedChangelogReleases(getAppVersionInfo().version);
}
