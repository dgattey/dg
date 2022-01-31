import dbClient from 'api/server/networkClients/dbClient';
import type { StravaWebhookEvent } from 'api/types/StravaWebhookEvent';
import fetchStravaActivityFromApi from './fetchStravaActivityFromApi';

// If an update was applied this number of ms or less ago, drop the update
const UPDATE_THRESHOLD_IN_MS = 60000;

/**
 * Fetch latest version of the activity from Strava's API and creates
 * or updates the db row for it. Only fetches/updates if the existing
 * data for the activity in the db hasn't been updated in the last minute.
 */
const fetchAndUpsertActivityInDb = async (id: number) => {
  const existingActivity = await dbClient.stravaActivity.findUnique({
    where: {
      id,
    },
    select: {
      lastUpdate: true,
    },
  });
  if (
    existingActivity?.lastUpdate &&
    existingActivity.lastUpdate > Date.now() - UPDATE_THRESHOLD_IN_MS
  ) {
    // Last update was too recent
    return;
  }

  const latestActivityData = await fetchStravaActivityFromApi(id);
  if (!latestActivityData) {
    throw new Error(`Missing activity data for ${id}`);
  }
  return dbClient.stravaActivity.upsert({
    create: {
      id,
      activityData: latestActivityData,
      lastUpdate: Date.now(),
    },
    update: {
      activityData: latestActivityData,
      lastUpdate: Date.now(),
    },
    where: {
      id,
    },
  });
};

/**
 * Deletes an activity id'd by `id` from the DB if it exists, and
 * it's fine if it doesn't.
 */
const deleteActivityFromDb = async (id: number) =>
  dbClient.stravaActivity.delete({ where: { id } });

/**
 * Given a new webhook update event, handles it:
 *
 * 1. If it's a create, fetches the latest version of the activity from
 * Strava's API and creates a new db row in the activity table for it. If a
 * db row already exists, just updates it, though we should never see this
 * happen in real usage.
 *
 * 2. If it's an update, fetches the latest version of the activity and
 * creates or updates a row for it, as long as it's been more than 1 minute
 * since the last update to that row. If it's been updated recently, we just
 * drop the webhook event so as not to clobber the Strava API
 *
 * 3. If it's a delete, delete the db row corresponding to the activity id
 * if it exists. If not, drop the event.
 */
const syncStravaWebhookUpdateWithDb = async (event: StravaWebhookEvent) => {
  switch (event.aspect_type) {
    case 'create':
      await fetchAndUpsertActivityInDb(event.object_id);
      return;
    case 'update':
      await fetchAndUpsertActivityInDb(event.object_id);
      return;
    case 'delete':
      await deleteActivityFromDb(event.object_id);
  }
};

export default syncStravaWebhookUpdateWithDb;
