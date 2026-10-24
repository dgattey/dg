import 'server-only';

import type { RenderableChangelogSnapshot } from '@dg/content-models/contentful/renderables/changelogSnapshots';
import { fetchChangelogSnapshots } from '@dg/services/contentful/fetchChangelogSnapshots';
import { type ChangelogRelease, fetchReleases } from '@dg/services/github/fetchReleases';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';
import { getAppVersionInfo } from './version';

<<<<<<< HEAD
async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.changelog);
  return await fetchReleases({ fallbackVersion: appVersion });
=======
const CHANGELOG_TAG = 'changelog';
const CONTENTFUL_TAG = 'contentful';

async function fetchCachedChangelogReleases(appVersion: string): Promise<Array<ChangelogRelease>> {
  'use cache';
  cacheLife('max');
  cacheTag(CHANGELOG_TAG);
  cacheTag(CONTENTFUL_TAG);
  const [releases, snapshots] = await Promise.all([
    fetchReleases({ fallbackVersion: appVersion }),
    fetchChangelogSnapshots().catch(() => new Map<string, RenderableChangelogSnapshot>()),
  ]);
  return releases.map((release) => ({
    ...release,
    snapshot: snapshots.get(release.tag) ?? null,
  }));
>>>>>>> e6781be6 (Show historical snapshot polaroids on the changelog)
}

export async function getChangelogReleases(): Promise<Array<ChangelogRelease>> {
  return await fetchCachedChangelogReleases(getAppVersionInfo().version);
}
