import 'server-only';

import { fetchCurrentLocation } from '@dg/services/contentful/fetchCurrentLocation';
import { fetchFooterLinks } from '@dg/services/contentful/fetchFooterLinks';
import { fetchIntroContent } from '@dg/services/contentful/fetchIntroContent';
import { fetchLinkByName } from '@dg/services/contentful/fetchLinkByName';
import { fetchProjects } from '@dg/services/contentful/fetchProjects';
import { fetchSideProjects } from '@dg/services/contentful/fetchSideProjects';
import { cacheLife, cacheTag } from 'next/cache';

const CONTENTFUL_TAG = 'contentful';

/**
 * Shared Contentful cache life/tag. Each caller still owns its own `'use cache'`
 * so Next keeps a distinct cache entry per wrapper (args alone are not enough
 * when the fetcher callback is not serializable).
 */
async function cachedContentful<T>(fn: () => Promise<T>): Promise<T> {
  cacheLife('default');
  cacheTag(CONTENTFUL_TAG);
  return await fn();
}

export const getProjects = async () => {
  'use cache';
  return await cachedContentful(fetchProjects);
};

export const getSideProjects = async () => {
  'use cache';
  return await cachedContentful(fetchSideProjects);
};

export const getIntroContent = async () => {
  'use cache';
  return await cachedContentful(fetchIntroContent);
};

export const getFooterLinks = async () => {
  'use cache';
  return await cachedContentful(fetchFooterLinks);
};

/**
 * Gets a specific link by name (partial match on title) directly from Contentful.
 */
export const getLinkByName = async (name: string) => {
  'use cache';
  return await cachedContentful(() => fetchLinkByName(name));
};

export const getCurrentLocation = async () => {
  'use cache';
  return await cachedContentful(fetchCurrentLocation);
};
