import 'server-only';

import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife } from 'next/cache';
import { version } from '../../../../package.json';

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('days');
  return await fetchReleases({ fallbackVersion: version });
}
