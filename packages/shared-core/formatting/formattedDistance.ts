export const METERS_PER_MILE = 1609.344;

const countFormatter = new Intl.NumberFormat('en-US');

const distanceFormatter = Intl.NumberFormat(undefined, {
  compactDisplay: 'long',
  maximumFractionDigits: 1,
});

export function formatCount(value: number): string {
  return countFormatter.format(Math.round(value));
}

/**
 * Converts meters to miles using a known conversion factor.
 */
function metersToMiles(value: number) {
  return value / METERS_PER_MILE;
}

/**
 * Converts meters to miles and outputs a nicely formatted string
 * for display usage.
 */
export function formattedDistance({
  distanceInMeters,
}: {
  distanceInMeters: number | undefined | null;
}) {
  if (!distanceInMeters) {
    return null;
  }
  const distanceInMiles = metersToMiles(distanceInMeters);
  return `${distanceFormatter.format(distanceInMiles)} miles`;
}
