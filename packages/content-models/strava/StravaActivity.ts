import * as v from 'valibot';

/**
 * API response schema for the subset of Strava activity fields we use (snake_case).
 */
export const stravaActivityApiSchema = v.looseObject({
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
  id: v.number(),
  kudos_count: v.optional(v.nullable(v.number())),
  location_city: v.optional(v.nullable(v.string())),
  location_country: v.optional(v.nullable(v.string())),
  location_state: v.optional(v.nullable(v.string())),
  max_speed: v.optional(v.nullable(v.number())),
  moving_time: v.optional(v.nullable(v.number())),
  name: v.optional(v.nullable(v.string())),
  perceived_exertion: v.optional(v.nullable(v.string())),
  photo_count: v.optional(v.nullable(v.number())),
  pr_count: v.optional(v.nullable(v.number())),
  start_date: v.optional(v.nullable(v.string())),
  total_elevation_gain: v.optional(v.nullable(v.number())),
  type: v.string(),
});

export type StravaActivityApi = v.InferOutput<typeof stravaActivityApiSchema>;

/**
 * Domain activity type (camelCase).
 */
export type StravaActivity = {
  id: number;
  type: string;
  achievementCount?: number | null;
  averageSpeed?: number | null;
  calories?: number | null;
  commentCount?: number | null;
  commute?: boolean | null;
  description?: string | null;
  distance?: number | null;
  elapsedTime?: number | null;
  elevHigh?: number | null;
  elevLow?: number | null;
  kudosCount?: number | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  locationState?: string | null;
  maxSpeed?: number | null;
  movingTime?: number | null;
  name: string;
  perceivedExertion?: string | null;
  photoCount?: number | null;
  prCount?: number | null;
  startDate?: string | null;
  totalElevationGain?: number | null;
  relativeStartDate?: string | null;
  url: string;
};

/**
 * Schema for stored activities (camelCase).
 */
export const stravaActivitySchema = v.looseObject({
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
  id: v.number(),
  kudosCount: v.optional(v.nullable(v.number())),
  locationCity: v.optional(v.nullable(v.string())),
  locationCountry: v.optional(v.nullable(v.string())),
  locationState: v.optional(v.nullable(v.string())),
  maxSpeed: v.optional(v.nullable(v.number())),
  movingTime: v.optional(v.nullable(v.number())),
  name: v.optional(v.nullable(v.string())),
  perceivedExertion: v.optional(v.nullable(v.string())),
  photoCount: v.optional(v.nullable(v.number())),
  prCount: v.optional(v.nullable(v.number())),
  relativeStartDate: v.optional(v.nullable(v.string())),
  startDate: v.optional(v.nullable(v.string())),
  totalElevationGain: v.optional(v.nullable(v.number())),
  type: v.string(),
  url: v.optional(v.nullable(v.string())),
});

export type StravaActivityStored = v.InferOutput<typeof stravaActivitySchema>;

export const normalizeStravaActivity = (activity: StravaActivityStored): StravaActivity => ({
  ...activity,
  name: activity.name ?? 'Strava Activity',
  url: activity.url ?? `https://www.strava.com/activities/${activity.id}`,
});

/**
 * Converts a Strava API activity payload into camelCase domain data.
 */
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
  id: activity.id,
  kudosCount: activity.kudos_count,
  locationCity: activity.location_city,
  locationCountry: activity.location_country,
  locationState: activity.location_state,
  maxSpeed: activity.max_speed,
  movingTime: activity.moving_time,
  name: activity.name ?? 'Strava Activity',
  perceivedExertion: activity.perceived_exertion,
  photoCount: activity.photo_count,
  prCount: activity.pr_count,
  startDate: activity.start_date,
  totalElevationGain: activity.total_elevation_gain,
  type: activity.type,
  url: `https://www.strava.com/activities/${activity.id}`,
});
