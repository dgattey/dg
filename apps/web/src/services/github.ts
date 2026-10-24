import 'server-only';

import type { RenderableChangelogSnapshot } from '@dg/content-models/contentful/renderables/changelogSnapshots';
import { fetchChangelogSnapshots } from '@dg/services/contentful/fetchChangelogSnapshots';
import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';
import { getAppVersionInfo } from './version';

async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.changelog);
  cacheTag(CACHE_TAGS.contentful);
  const [releases, snapshots] = await Promise.all([
    fetchReleases({ fallbackVersion: appVersion }),
    fetchChangelogSnapshots().catch(() => new Map<string, RenderableChangelogSnapshot>()),
  ]);
  return releases.map((release) => ({
    ...release,
    snapshot: snapshots.get(release.tag) ?? null,
  }));
}

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  return await fetchCachedChangelogReleases(getAppVersionInfo().version);
}
