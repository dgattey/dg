'use strict';

const NORMALIZE_STRAVA_ACTIVITY_DATA_SQL = `
UPDATE "StravaActivity" AS target
SET "activityData" = (
  jsonb_strip_nulls(
    jsonb_build_object(
      'achievementCount', COALESCE(src.d->'achievementCount', src.d->'achievement_count'),
      'averageSpeed', COALESCE(src.d->'averageSpeed', src.d->'average_speed'),
      'calories', src.d->'calories',
      'commentCount', COALESCE(src.d->'commentCount', src.d->'comment_count'),
      'commute', src.d->'commute',
      'description', src.d->'description',
      'distance', src.d->'distance',
      'elapsedTime', COALESCE(src.d->'elapsedTime', src.d->'elapsed_time'),
      'elevHigh', COALESCE(src.d->'elevHigh', src.d->'elev_high'),
      'elevLow', COALESCE(src.d->'elevLow', src.d->'elev_low'),
      'endLatlng', COALESCE(src.d->'endLatlng', src.d->'end_latlng'),
      'gear', CASE
        WHEN jsonb_typeof(src.d->'gear') = 'object' THEN
          (src.d->'gear') - 'resource_state' ||
          CASE
            WHEN (src.d->'gear') ? 'resource_state' AND NOT ((src.d->'gear') ? 'resourceState')
            THEN jsonb_build_object('resourceState', src.d->'gear'->'resource_state')
            ELSE '{}'::jsonb
          END
        ELSE src.d->'gear'
      END,
      'gearId', COALESCE(src.d->'gearId', src.d->'gear_id'),
      'id', COALESCE(src.d->'id', to_jsonb(src.row_id)),
      'kudosCount', COALESCE(src.d->'kudosCount', src.d->'kudos_count'),
      'locationCity', COALESCE(src.d->'locationCity', src.d->'location_city'),
      'locationCountry', COALESCE(src.d->'locationCountry', src.d->'location_country'),
      'locationState', COALESCE(src.d->'locationState', src.d->'location_state'),
      'map', CASE
        WHEN jsonb_typeof(src.d->'map') = 'object' THEN
          (src.d->'map') - 'summary_polyline' - 'resource_state' ||
          CASE
            WHEN (src.d->'map') ? 'summary_polyline' AND NOT ((src.d->'map') ? 'summaryPolyline')
            THEN jsonb_build_object('summaryPolyline', src.d->'map'->'summary_polyline')
            ELSE '{}'::jsonb
          END
        ELSE src.d->'map'
      END,
      'maxSpeed', COALESCE(src.d->'maxSpeed', src.d->'max_speed'),
      'movingTime', COALESCE(src.d->'movingTime', src.d->'moving_time'),
      'name', COALESCE(src.d->'name', to_jsonb('Strava Activity'::text)),
      'perceivedExertion', COALESCE(src.d->'perceivedExertion', src.d->'perceived_exertion'),
      'photoCount', COALESCE(src.d->'photoCount', src.d->'photo_count'),
      'photos', CASE
        WHEN jsonb_typeof(src.d->'photos') = 'object' THEN
          jsonb_set(
            src.d->'photos',
            '{primary}',
            CASE
              WHEN jsonb_typeof(src.d->'photos'->'primary') = 'object' THEN
                (src.d->'photos'->'primary') - 'unique_id' ||
                CASE
                  WHEN (src.d->'photos'->'primary') ? 'unique_id' AND NOT ((src.d->'photos'->'primary') ? 'uniqueId')
                  THEN jsonb_build_object('uniqueId', src.d->'photos'->'primary'->'unique_id')
                  ELSE '{}'::jsonb
                END
              ELSE COALESCE(src.d->'photos'->'primary', 'null'::jsonb)
            END
          )
        ELSE src.d->'photos'
      END,
      'prCount', COALESCE(src.d->'prCount', src.d->'pr_count'),
      'private', src.d->'private',
      'sportType', COALESCE(src.d->'sportType', src.d->'sport_type'),
      'startDate', COALESCE(
        src.d->'startDate',
        src.d->'start_date',
        to_jsonb(to_char(src.row_start AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
      ),
      'startDateLocal', COALESCE(src.d->'startDateLocal', src.d->'start_date_local'),
      'startLatlng', COALESCE(src.d->'startLatlng', src.d->'start_latlng'),
      'totalElevationGain', COALESCE(src.d->'totalElevationGain', src.d->'total_elevation_gain'),
      'type', src.d->'type',
      'url', COALESCE(src.d->'url', to_jsonb('https://www.strava.com/activities/' || src.row_id::text)),
      'visibility', src.d->'visibility'
    )
  )
)::json
FROM (
  SELECT id AS row_id, "activityStartDate" AS row_start, "activityData"::jsonb AS d
  FROM "StravaActivity"
) AS src
WHERE
  target.id = src.row_id
  AND (
    (src.d ?| ARRAY[
      'achievement_count',
      'average_speed',
      'comment_count',
      'elapsed_time',
      'elev_high',
      'elev_low',
      'end_latlng',
      'gear_id',
      'kudos_count',
      'location_city',
      'location_country',
      'location_state',
      'max_speed',
      'moving_time',
      'perceived_exertion',
      'photo_count',
      'pr_count',
      'relativeStartDate',
      'sport_type',
      'start_date',
      'start_date_local',
      'start_latlng',
      'total_elevation_gain'
    ])
    OR NOT (src.d ? 'startDate')
    OR NOT (src.d ? 'name')
    OR NOT (src.d ? 'url')
    OR ((src.d->'map') ? 'summary_polyline')
    OR ((src.d->'gear') ? 'resource_state')
    OR ((src.d->'photos'->'primary') ? 'unique_id')
  );
`;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(NORMALIZE_STRAVA_ACTIVITY_DATA_SQL, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down() {},
};
