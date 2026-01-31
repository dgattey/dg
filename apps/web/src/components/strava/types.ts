export type StravaActivity = {
  id?: number;
  type?: string;
  name?: string;
  description?: string | null;
  start_date?: string;
  distance?: number;
  relativeStartDate?: string | null;
  url?: string;
};
