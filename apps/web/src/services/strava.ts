import 'server-only';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';

const LATEST_ACTIVITY_TAG = 'latest-activity';

const STRAVA_HISTORY_TAG = 'strava-history';

export const getLatestActivity = async () => {
  'use cache';
  cacheLife('max');
  cacheTag(LATEST_ACTIVITY_TAG);
  return await fetchLatestStravaActivityFromDb();
};

export const getStravaHistory = async (): Promise<StravaHistory | null> => {
  'use cache';
  cacheLife('max');
  cacheTag(STRAVA_HISTORY_TAG);
  return await fetchStravaHistoryFromDb();
};
