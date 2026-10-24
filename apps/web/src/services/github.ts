import 'server-only';

import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';
import { getAppVersionInfo } from './version';

async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.changelog);
  return await fetchReleases({ fallbackVersion: appVersion });
}

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  return await fetchCachedChangelogReleases(getAppVersionInfo().version);
}
