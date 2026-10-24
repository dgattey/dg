import 'server-only';

import { fetchBooks } from '@dg/services/contentful/fetchBooks';
import { fetchCurrentLocation } from '@dg/services/contentful/fetchCurrentLocation';
import { fetchFooterContent } from '@dg/services/contentful/fetchFooterContent';
import { fetchHeaderContent } from '@dg/services/contentful/fetchHeaderContent';
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
  cacheLife('max');
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

export const getFooterContent = async () => {
  'use cache';
  return await cachedContentful(fetchFooterContent);
};

export const getHeaderContent = async () => {
  'use cache';
  return await cachedContentful(fetchHeaderContent);
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

export const getBooks = async () => {
  'use cache';
  cacheLife('max');
  cacheTag(CONTENTFUL_TAG);
  return await fetchBooks();
};
