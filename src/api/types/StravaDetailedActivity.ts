type ActivityType = 'Ride' | 'Run' | string;

interface Athlete {
  /**
   * Always my id
   */
  id: number;
}

interface PolylineMap {
  id: string;
  polyline: string;
  summary_polyline: string;
}

interface Gear {
  id: string;

  /**
   * Name of the bike/etc
   */
  name: string;

  /**
   * Distance in miles
   */
  converted_distance: number;
}

interface PhotoSummary {
  count: number;
  primary: {
    unique_id: string;

    /**
     * Maps from size to image url
     */
    urls: Record<string, string>;
  };
}

/**
 * An instance of an activity with detail from Strava. Only
 * uses all the simple types I might use - not everything
 * everything!
 * @link https://developers.strava.com/docs/reference/#api-models-DetailedActivity
 */
export interface StravaDetailedActivity {
  achievement_count: number;
  athlete_count: number;
  athlete: Athlete;
  average_cadence: number;
  average_heartrate: number;
  average_speed: number;
  average_watts: number;
  calories: number;
  comment_count: number;
  commute: boolean;
  description: string;
  device_name: string;
  device_watts: boolean;
  display_hide_heartrate_option: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  embed_token: string;
  external_id: string;
  flagged: boolean;
  from_accepted_tag: boolean;
  gear: Gear;
  gear_id: string;
  has_heartrate: boolean;
  has_kudoed: boolean;
  heartrate_opt_out: boolean;
  id: number;
  kilojoules: number;
  kudos_count: number;
  location_city: string;
  location_country: string;
  location_state: string;
  manual: boolean;
  map: PolylineMap;
  max_heartrate: number;
  max_speed: number;
  max_watts: number;
  moving_time: number;
  name: string;
  perceived_exertion: string;
  photo_count: number;
  photos: PhotoSummary;
  pr_count: number;
  prefer_perceived_exertion: string;
  private_note: string;
  private: boolean;
  start_date_local: string;
  start_date: string;
  start_latitude: number;
  start_longitude: number;
  suffer_score: number;
  timezone: string;
  total_elevation_gain: number;
  total_photo_count: number;
  trainer: boolean;
  type: ActivityType;
  upload_id_str: string;
  upload_id: number;
  utc_offset: number;
  visibility: string;
  workout_type: number;
}
