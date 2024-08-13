/**
 * Could be anything but is most commonly 'Ride' or 'Run'
 */
type ActivityType = string;

type Athlete = {
  /**
   * Always my id
   */
  id: number;
};

type PolylineMap = {
  id: string;
  polyline: string;
  summary_polyline: string;
};

type Gear = {
  id: string;

  /**
   * Name of the bike/etc
   */
  name: string;

  /**
   * Distance in miles
   */
  converted_distance: number;
};

type PhotoSummary = {
  count: number;
  primary: {
    unique_id: string;

    /**
     * Maps from size to image url
     */
    urls: Record<string, string>;
  };
};

/**
 * An instance of an activity with detail from Strava. Only
 * uses all the simple types I might use - not everything
 * everything!
 * {@link https://developers.strava.com/docs/reference/#api-models-DetailedActivity}
 */
export type StravaDetailedActivity = {
  achievement_count: number;
  athlete: Athlete;
  average_speed: number;
  calories: number;
  comment_count: number;
  commute: boolean;
  description: string;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  gear: Gear;
  gear_id: string;
  id: number;
  kudos_count: number;
  location_city: string;
  location_country: string;
  location_state: string;
  map: PolylineMap;
  max_speed: number;
  moving_time: number;
  name: string;
  perceived_exertion: string;
  photo_count: number;
  photos: PhotoSummary;
  pr_count: number;
  start_date: string;
  start_latitude: number;
  start_longitude: number;
  total_elevation_gain: number;
  type: ActivityType;
};
