import 'server-only';

import type { StravaWebhookEvent } from '@dg/content-models/strava/StravaWebhookEvent';
import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { fetchStravaActivityFromApi } from './fetchStravaActivityFromApi';

const UPDATE_THRESHOLD_IN_MS = 60000;

const fetchFromApiAndSaveToDb = async (id: number) => {
  const existingActivity = await db.StravaActivity.findOne({
    attributes: ['lastUpdate'],
    where: { id },
  });
  if (
    existingActivity?.lastUpdate &&
    Number(existingActivity.lastUpdate) > Date.now() - UPDATE_THRESHOLD_IN_MS
  ) {
    log.info('Dropping Strava webhook update - last update was too recent', {
      id,
      lastUpdate: existingActivity.lastUpdate,
      threshold: Date.now() - UPDATE_THRESHOLD_IN_MS,
    });
    return;
  }

  const latestActivityData = await fetchStravaActivityFromApi(id);
  if (!latestActivityData?.startDate) {
    log.error('Missing activity data', { id, latestActivityData });
    throw new Error(`Missing activity data for ${id}`);
  }
  const updatedActivity = await db.StravaActivity.upsert({
    activityData: latestActivityData,
    activityStartDate: new Date(latestActivityData.startDate),
    id,
    lastUpdate: new Date(),
  });
  log.info('Upserted Strava activity', { updatedActivity });
  return updatedActivity[0];
};

const deleteActivityFromDb = async (id: number) => db.StravaActivity.destroy({ where: { id } });

export const syncStravaWebhookUpdateWithDb = async (event: StravaWebhookEvent) => {
  switch (event.aspect_type) {
    case 'create':
      await fetchFromApiAndSaveToDb(event.object_id);
      return;
    case 'update':
      await fetchFromApiAndSaveToDb(event.object_id);
      return;
    case 'delete':
      await deleteActivityFromDb(event.object_id);
  }
};
