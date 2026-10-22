const TIME_ZONE = 'America/Los_Angeles';
const METERS_PER_MILE = 1609.344;
const FEET_PER_METER = 3.280_84;

const countFormat = new Intl.NumberFormat('en-US');
const tenthFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const compactFormat = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
  notation: 'compact',
});
const dayFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
});
const dateFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
  year: 'numeric',
});

export function formatCount(value: number): string {
  return countFormat.format(Math.round(value));
}

/** Miles to a tenth under a hundred (`15.9`), whole miles above (`4,865`). */
export function formatMiles(meters: number): string {
  const miles = meters / METERS_PER_MILE;
  return miles < 100 ? tenthFormat.format(miles) : formatCount(miles);
}

export function formatFeet(meters: number): string {
  return formatCount(meters * FEET_PER_METER);
}

/** `62,800` feet → `62.8k`, `1,210,000` → `1.21M`, small climbs unchanged. */
export function formatCompactFeet(meters: number): string {
  return compactFormat.format(Math.round(meters * FEET_PER_METER)).replace('K', 'k');
}

/** `4,320` seconds → `1h 12m`. */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** A start time as the Pacific day it fell on, `Oct 15`. */
export function formatOutingDay(startDate: string): string {
  return dayFormat.format(new Date(startDate));
}

/** The same day with its year, `Oct 15, 2024`, for outings that may be old. */
export function formatOutingDate(startDate: string): string {
  return dateFormat.format(new Date(startDate));
}

export function formatRouteCount(routes: number): string {
  if (routes === 0) {
    return 'No routes';
  }
  return routes === 1 ? '1 route' : `${formatCount(routes)} routes`;
}
