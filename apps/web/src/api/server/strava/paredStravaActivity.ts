import { StravaDetailedActivity } from 'api/types/StravaDetailedActivity';

/**
 * These are the only fields we care about for now
 */
const FIELDS: Array<keyof StravaDetailedActivity> = [
  'id',
  'map',
  'gear',
  'name',
  'type',
  'photos',
  'calories',
  'kilojoules',
  'distance',
  'pr_count',
  'max_speed',
  'start_date',
  'description',
  'moving_time',
  'average_speed',
  'average_watts',
  'achievement_count',
  'total_elevation_gain',
];

// So we can use with an includes later
const UNTYPED_FIELDS: Array<string> = FIELDS;

/**
 * We get a ton of data from Strava we don't use so to keep our db and
 * return values from /api endpoints lean, we delete a bunch of fields
 * from the object when we process it.
 */
export const paredStravaActivity = (
  activity: (StravaDetailedActivity & Record<string, unknown>) | null | undefined,
) => {
  if (!activity) {
    return null;
  }
  const filtered: Partial<StravaDetailedActivity & Record<string, unknown>> = {};
  Object.keys(activity)
    .filter((key) => UNTYPED_FIELDS.includes(key))
    .forEach((key) => {
      filtered[key] = activity[key];
    });
  return filtered;
};
