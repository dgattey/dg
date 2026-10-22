import 'server-only';

import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife, cacheTag } from 'next/cache';
import { version } from '../../../../package.json';

const CHANGELOG_TAG = 'changelog';

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('days');
  cacheTag(CHANGELOG_TAG);
  return await fetchReleases({ fallbackVersion: version });
}
