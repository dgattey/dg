import 'server-only';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const LATEST_ACTIVITY_TAG = 'latest-activity';

const STRAVA_HISTORY_TAG = 'strava-history';

/**
 * Gets the latest Strava activity. Returns null if tokens are missing.
 *
 * Relative times ("2 days ago") are derived on the client from `startDate`:
 * anything computed against the clock here would be frozen for the life of
 * this 'days' cache entry.
 */
export const getLatestActivity = async () => {
  'use cache';
  cacheLife('days');
  cacheTag(LATEST_ACTIVITY_TAG);
  return await withMissingTokenFallback(fetchLatestStravaActivityFromDb());
};

/**
 * Every stored outing, summarized. It reads the whole table, so it caches for
 * hours; the webhook and the dev-console backfill revalidate the tag.
 */
export const getStravaHistory = async (): Promise<StravaHistory | null> => {
  'use cache';
  cacheLife('hours');
  cacheTag(STRAVA_HISTORY_TAG);
  return await withMissingTokenFallback(fetchStravaHistoryFromDb());
};
