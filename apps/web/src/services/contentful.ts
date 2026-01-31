import 'server-only';

import { fetchCurrentLocation } from '@dg/services/contentful/fetchCurrentLocation';
import { fetchFooterLinks } from '@dg/services/contentful/fetchFooterLinks';
import { fetchIntroContent } from '@dg/services/contentful/fetchIntroContent';
import { fetchProjects } from '@dg/services/contentful/fetchProjects';
import { cacheLife, cacheTag } from 'next/cache';

const CONTENTFUL_TAG = 'contentful';

export const getProjects = async () => {
  'use cache';
  cacheLife('default');
  cacheTag(CONTENTFUL_TAG);
  return await fetchProjects();
};

export const getIntroContent = async () => {
  'use cache';
  cacheLife('default');
  cacheTag(CONTENTFUL_TAG);
  return await fetchIntroContent();
};

export const getFooterLinks = async () => {
  'use cache';
  cacheLife('default');
  cacheTag(CONTENTFUL_TAG);
  return await fetchFooterLinks();
};

export const getCurrentLocation = async () => {
  'use cache';
  cacheLife('default');
  cacheTag(CONTENTFUL_TAG);
  return await fetchCurrentLocation();
};
