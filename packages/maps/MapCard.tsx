import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  border: 'none',
};

/**
 * Server component wrapper for the map.
 * PigeonMap is a client component for interactivity.
 */
export function MapCard({ location }: { location: MapLocation | null | undefined }) {
  if (!location) {
    return <ContentCard sx={mapCardSx} />;
  }

  return (
    <ContentCard sx={mapCardSx}>
      <PigeonMap location={location} />
    </ContentCard>
  );
}
