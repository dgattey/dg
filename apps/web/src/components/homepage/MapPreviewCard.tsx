import { LazyLoadedMap } from '@dg/maps/LazyLoadedMap';
import type { MapLocation } from '@dg/services/contentful/MapLocation';

/**
 * Shows a preview of the full map card, to be fetched on hover.
 */
export function MapPreviewCard({ location }: { location: MapLocation | null }) {
  return <LazyLoadedMap location={location} />;
}
