import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { LazyLoadedMap } from '@dg/maps/LazyLoadedMap';

/**
 * Shows a preview of the full map card, to be fetched on hover.
 */
export function MapPreviewCard({ location }: { location: MapLocation | null }) {
  return <LazyLoadedMap location={location} />;
}
