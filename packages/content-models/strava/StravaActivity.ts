import * as v from 'valibot';

/** Strava sends `[]` instead of a coordinate pair for activities recorded without GPS. */
const latLngSchema = v.optional(
  v.nullable(
    v.pipe(
      v.array(v.number()),
      v.transform(([lat, lng]): [number, number] | null =>
        lat === undefined || lng === undefined ? null : [lat, lng],
      ),
    ),
  ),
);

const optBool = v.optional(v.nullable(v.boolean()));
const optNum = v.optional(v.nullable(v.number()));
const optStr = v.optional(v.nullable(v.string()));

const FIELD_SCHEMA_BY_KIND = {
  boolean: optBool,
  latlng: latLngSchema,
  number: optNum,
  'number-required': v.number(),
  string: optStr,
  'string-required': v.string(),
} as const;

export const STRAVA_ACTIVITY_FIELD_KINDS = {
  achievement_count: 'number',
  average_speed: 'number',
  calories: 'number',
  comment_count: 'number',
  commute: 'boolean',
  description: 'string',
  distance: 'number',
  elapsed_time: 'number',
  elev_high: 'number',
  elev_low: 'number',
  end_latlng: 'latlng',
  gear_id: 'string',
  id: 'number-required',
  kudos_count: 'number',
  location_city: 'string',
  location_country: 'string',
  location_state: 'string',
  max_speed: 'number',
  moving_time: 'number',
  name: 'string',
  perceived_exertion: 'number',
  photo_count: 'number',
  pr_count: 'number',
  private: 'boolean',
  sport_type: 'string',
  start_date: 'string',
  start_date_local: 'string',
  start_latlng: 'latlng',
  total_elevation_gain: 'number',
  type: 'string-required',
  visibility: 'string',
} as const satisfies Record<string, keyof typeof FIELD_SCHEMA_BY_KIND>;

type FieldKindMap = typeof STRAVA_ACTIVITY_FIELD_KINDS;

type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

export function toCamelCaseKey(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

const gearSchema = v.object({
  distance: optNum,
  id: v.string(),
  name: v.string(),
  primary: optBool,
  resource_state: optNum,
});

const mapSchema = v.object({
  id: optStr,
  polyline: optStr,
  summary_polyline: optStr,
});

const photosPrimarySchema = v.object({
  unique_id: optStr,
  urls: v.optional(v.nullable(v.record(v.string(), v.string()))),
});

const photosSchema = v.object({
  count: optNum,
  primary: v.optional(v.nullable(photosPrimarySchema)),
});

const gearStoredSchema = v.object({
  distance: optNum,
  id: v.string(),
  name: v.string(),
  primary: optBool,
  resourceState: optNum,
});

const mapStoredSchema = v.object({
  id: optStr,
  polyline: optStr,
  summaryPolyline: optStr,
});

const photosPrimaryStoredSchema = v.object({
  uniqueId: optStr,
  urls: v.optional(v.nullable(v.record(v.string(), v.string()))),
});

const photosStoredSchema = v.object({
  count: optNum,
  primary: v.optional(v.nullable(photosPrimaryStoredSchema)),
});

type ApiScalarEntries = {
  [K in keyof FieldKindMap]: (typeof FIELD_SCHEMA_BY_KIND)[FieldKindMap[K]];
};

type StoredScalarEntries = {
  [K in keyof FieldKindMap as Exclude<
    CamelCase<K & string>,
    'startDate'
  >]: (typeof FIELD_SCHEMA_BY_KIND)[FieldKindMap[K]];
};

const apiScalarEntries = Object.fromEntries(
  Object.entries(STRAVA_ACTIVITY_FIELD_KINDS).map(([key, kind]) => [
    key,
    FIELD_SCHEMA_BY_KIND[kind],
  ]),
) as ApiScalarEntries;

const storedScalarEntries = Object.fromEntries(
  Object.entries(STRAVA_ACTIVITY_FIELD_KINDS)
    .filter(([key]) => key !== 'start_date')
    .map(([key, kind]) => [toCamelCaseKey(key), FIELD_SCHEMA_BY_KIND[kind]]),
) as StoredScalarEntries;

const apiSchemaEntries = {
  ...apiScalarEntries,
  gear: v.optional(v.nullable(gearSchema)),
  map: v.optional(v.nullable(mapSchema)),
  photos: v.optional(v.nullable(photosSchema)),
};

const storedSchemaEntries = {
  ...storedScalarEntries,
  gear: v.optional(v.nullable(gearStoredSchema)),
  map: v.optional(v.nullable(mapStoredSchema)),
  photos: v.optional(v.nullable(photosStoredSchema)),
  startDate: v.pipe(v.string(), v.nonEmpty()),
  url: optStr,
};

export const stravaActivityApiSchema = v.looseObject(apiSchemaEntries);

export const stravaActivitySchema = v.looseObject(storedSchemaEntries);

type StravaActivityApi = v.InferOutput<ReturnType<typeof v.object<typeof apiSchemaEntries>>>;

type StravaActivityStored = v.InferOutput<ReturnType<typeof v.object<typeof storedSchemaEntries>>>;

export type StravaActivity = Omit<StravaActivityStored, 'name' | 'url'> & {
  name: string;
  url: string;
};

export const normalizeStravaActivity = (activity: StravaActivityStored): StravaActivity => ({
  ...activity,
  name: activity.name ?? 'Strava Activity',
  url: activity.url ?? `https://www.strava.com/activities/${activity.id}`,
});

export const mapStravaActivityFromApi = (activity: StravaActivityApi): StravaActivity => {
  const scalars: Record<string, unknown> = {};
  for (const snakeKey of Object.keys(STRAVA_ACTIVITY_FIELD_KINDS)) {
    scalars[toCamelCaseKey(snakeKey)] = activity[snakeKey as keyof StravaActivityApi];
  }
  return {
    ...(scalars as Omit<StravaActivity, 'gear' | 'map' | 'name' | 'photos' | 'startDate' | 'url'>),
    gear: activity.gear
      ? {
          distance: activity.gear.distance,
          id: activity.gear.id,
          name: activity.gear.name,
          primary: activity.gear.primary,
          resourceState: activity.gear.resource_state,
        }
      : null,
    map: activity.map
      ? {
          id: activity.map.id,
          polyline: activity.map.polyline,
          summaryPolyline: activity.map.summary_polyline,
        }
      : null,
    name: activity.name ?? 'Strava Activity',
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
    startDate: activity.start_date ?? '',
    url: `https://www.strava.com/activities/${activity.id}`,
  };
};
