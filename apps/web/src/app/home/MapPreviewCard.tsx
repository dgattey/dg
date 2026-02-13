import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';

/**
 * Shows a map card with the current location.
 */
export function MapPreviewCard({ location }: { location: MapLocation | null }) {
  return <MapCard location={location} />;
}
