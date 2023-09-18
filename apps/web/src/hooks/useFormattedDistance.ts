const distanceFormatter = Intl.NumberFormat(undefined, {
  compactDisplay: 'long',
  maximumFractionDigits: 1,
});

/**
 * Converts meters to miles using a known conversion factor.
 */
function metersToMiles(value: number) {
  return value / 1609.344;
}

/**
 * Converts meters to miles and outputs a nicely formatted string
 * for display usage.
 */
export function useFormattedDistance({
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
