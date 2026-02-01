import * as v from 'valibot';

// Nested object schemas for API response
const gearSchema = v.object({
  distance: v.optional(v.nullable(v.number())),
  id: v.string(),
  name: v.string(),
  primary: v.optional(v.nullable(v.boolean())),
  resource_state: v.optional(v.nullable(v.number())),
});

const mapSchema = v.object({
  id: v.optional(v.nullable(v.string())),
  polyline: v.optional(v.nullable(v.string())),
  summary_polyline: v.optional(v.nullable(v.string())),
});

const photosPrimarySchema = v.object({
  unique_id: v.optional(v.nullable(v.string())),
  urls: v.optional(v.nullable(v.record(v.string(), v.string()))),
});

const photosSchema = v.object({
  count: v.optional(v.nullable(v.number())),
  primary: v.optional(v.nullable(photosPrimarySchema)),
});

/**
 * API schema entries (snake_case). Defined once, used for both validation and type inference.
 * Field names and types match the Strava API v3 DetailedActivity model.
 * @see https://developers.strava.com/docs/reference/#api-models-DetailedActivity
 */
const apiSchemaEntries = {
  achievement_count: v.optional(v.nullable(v.number())),
  average_speed: v.optional(v.nullable(v.number())),
  calories: v.optional(v.nullable(v.number())),
  comment_count: v.optional(v.nullable(v.number())),
  commute: v.optional(v.nullable(v.boolean())),
  description: v.optional(v.nullable(v.string())),
  distance: v.optional(v.nullable(v.number())),
  elapsed_time: v.optional(v.nullable(v.number())),
  elev_high: v.optional(v.nullable(v.number())),
  elev_low: v.optional(v.nullable(v.number())),
  end_latlng: v.optional(v.nullable(v.tuple([v.number(), v.number()]))),
  gear: v.optional(v.nullable(gearSchema)),
  gear_id: v.optional(v.nullable(v.string())),
  id: v.number(),
  kudos_count: v.optional(v.nullable(v.number())),
  location_city: v.optional(v.nullable(v.string())),
  location_country: v.optional(v.nullable(v.string())),
  location_state: v.optional(v.nullable(v.string())),
  map: v.optional(v.nullable(mapSchema)),
  max_speed: v.optional(v.nullable(v.number())),
  moving_time: v.optional(v.nullable(v.number())),
  name: v.optional(v.nullable(v.string())),
  perceived_exertion: v.optional(v.nullable(v.number())),
  photo_count: v.optional(v.nullable(v.number())),
  photos: v.optional(v.nullable(photosSchema)),
  pr_count: v.optional(v.nullable(v.number())),
  sport_type: v.optional(v.nullable(v.string())),
  start_date: v.optional(v.nullable(v.string())),
  start_latlng: v.optional(v.nullable(v.tuple([v.number(), v.number()]))),
  total_elevation_gain: v.optional(v.nullable(v.number())),
  type: v.string(),
};

// Nested object schemas for stored data (camelCase)
const gearStoredSchema = v.object({
  distance: v.optional(v.nullable(v.number())),
  id: v.string(),
  name: v.string(),
  primary: v.optional(v.nullable(v.boolean())),
  resourceState: v.optional(v.nullable(v.number())),
});

const mapStoredSchema = v.object({
  id: v.optional(v.nullable(v.string())),
  polyline: v.optional(v.nullable(v.string())),
  summaryPolyline: v.optional(v.nullable(v.string())),
});

const photosPrimaryStoredSchema = v.object({
  uniqueId: v.optional(v.nullable(v.string())),
  urls: v.optional(v.nullable(v.record(v.string(), v.string()))),
});

const photosStoredSchema = v.object({
  count: v.optional(v.nullable(v.number())),
  primary: v.optional(v.nullable(photosPrimaryStoredSchema)),
});

/**
 * Stored schema entries (camelCase). Defined once, used for both validation and type inference.
 */
const storedSchemaEntries = {
  achievementCount: v.optional(v.nullable(v.number())),
  averageSpeed: v.optional(v.nullable(v.number())),
  calories: v.optional(v.nullable(v.number())),
  commentCount: v.optional(v.nullable(v.number())),
  commute: v.optional(v.nullable(v.boolean())),
  description: v.optional(v.nullable(v.string())),
  distance: v.optional(v.nullable(v.number())),
  elapsedTime: v.optional(v.nullable(v.number())),
  elevHigh: v.optional(v.nullable(v.number())),
  elevLow: v.optional(v.nullable(v.number())),
  endLatlng: v.optional(v.nullable(v.tuple([v.number(), v.number()]))),
  gear: v.optional(v.nullable(gearStoredSchema)),
  gearId: v.optional(v.nullable(v.string())),
  id: v.number(),
  kudosCount: v.optional(v.nullable(v.number())),
  locationCity: v.optional(v.nullable(v.string())),
  locationCountry: v.optional(v.nullable(v.string())),
  locationState: v.optional(v.nullable(v.string())),
  map: v.optional(v.nullable(mapStoredSchema)),
  maxSpeed: v.optional(v.nullable(v.number())),
  movingTime: v.optional(v.nullable(v.number())),
  name: v.optional(v.nullable(v.string())),
  perceivedExertion: v.optional(v.nullable(v.number())),
  photoCount: v.optional(v.nullable(v.number())),
  photos: v.optional(v.nullable(photosStoredSchema)),
  prCount: v.optional(v.nullable(v.number())),
  relativeStartDate: v.optional(v.nullable(v.string())),
  sportType: v.optional(v.nullable(v.string())),
  startDate: v.optional(v.nullable(v.string())),
  startLatlng: v.optional(v.nullable(v.tuple([v.number(), v.number()]))),
  totalElevationGain: v.optional(v.nullable(v.number())),
  type: v.string(),
  url: v.optional(v.nullable(v.string())),
};

/** API validation schema - uses looseObject to allow extra API fields */
export const stravaActivityApiSchema = v.looseObject(apiSchemaEntries);

/** Stored validation schema - uses looseObject to allow extra fields */
export const stravaActivitySchema = v.looseObject(storedSchemaEntries);

/** API response type - inferred from strict v.object (no index signature) */
export type StravaActivityApi = v.InferOutput<ReturnType<typeof v.object<typeof apiSchemaEntries>>>;

/** Stored activity type - inferred from strict v.object (no index signature) */
export type StravaActivityStored = v.InferOutput<
  ReturnType<typeof v.object<typeof storedSchemaEntries>>
>;

/** Domain activity type with required name/url */
export type StravaActivity = Omit<StravaActivityStored, 'name' | 'url'> & {
  name: string;
  url: string;
};

export const normalizeStravaActivity = (activity: StravaActivityStored): StravaActivity => ({
  ...activity,
  name: activity.name ?? 'Strava Activity',
  url: activity.url ?? `https://www.strava.com/activities/${activity.id}`,
});

/** Converts API response (snake_case) to domain type (camelCase) */
export const mapStravaActivityFromApi = (activity: StravaActivityApi): StravaActivity => ({
  achievementCount: activity.achievement_count,
  averageSpeed: activity.average_speed,
  calories: activity.calories,
  commentCount: activity.comment_count,
  commute: activity.commute,
  description: activity.description,
  distance: activity.distance,
  elapsedTime: activity.elapsed_time,
  elevHigh: activity.elev_high,
  elevLow: activity.elev_low,
  endLatlng: activity.end_latlng,
  gear: activity.gear
    ? {
        distance: activity.gear.distance,
        id: activity.gear.id,
        name: activity.gear.name,
        primary: activity.gear.primary,
        resourceState: activity.gear.resource_state,
      }
    : null,
  gearId: activity.gear_id,
  id: activity.id,
  kudosCount: activity.kudos_count,
  locationCity: activity.location_city,
  locationCountry: activity.location_country,
  locationState: activity.location_state,
  map: activity.map
    ? {
        id: activity.map.id,
        polyline: activity.map.polyline,
        summaryPolyline: activity.map.summary_polyline,
      }
    : null,
  maxSpeed: activity.max_speed,
  movingTime: activity.moving_time,
  name: activity.name ?? 'Strava Activity',
  perceivedExertion: activity.perceived_exertion,
  photoCount: activity.photo_count,
  photos: activity.photos
    ? {
        count: activity.photos.count,
        primary: activity.photos.primary
          ? {
              uniqueId: activity.photos.primary.unique_id,
              urls: activity.photos.primary.urls,
            }
          : null,
      }
    : null,
  prCount: activity.pr_count,
  sportType: activity.sport_type,
  startDate: activity.start_date,
  startLatlng: activity.start_latlng,
  totalElevationGain: activity.total_elevation_gain,
  type: activity.type,
  url: `https://www.strava.com/activities/${activity.id}`,
});
