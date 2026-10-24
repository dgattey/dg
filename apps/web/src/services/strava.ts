import 'server-only';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';

export const getLatestActivity = async () => {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.latestActivity);
  return await fetchLatestStravaActivityFromDb();
};

export const getStravaHistory = async (): Promise<StravaHistory | null> => {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.stravaHistory);
  return await fetchStravaHistoryFromDb();
};
