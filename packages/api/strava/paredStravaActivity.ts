import type { StravaDetailedActivity } from 'db/models/StravaDetailedActivity';

/**
 * These are the only fields we care about for now
 */
const FIELDS: Array<keyof StravaDetailedActivity> = [
  'achievement_count',
  'average_speed',
  'calories',
  'comment_count',
  'commute',
  'description',
  'distance',
  'elapsed_time',
  'elev_high',
  'elev_low',
  'id',
  'kudos_count',
  'location_city',
  'location_country',
  'location_state',
  'max_speed',
  'moving_time',
  'name',
  'perceived_exertion',
  'photo_count',
  'pr_count',
  'start_date',
  'total_elevation_gain',
  'type',
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
