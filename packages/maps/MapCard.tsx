'use client';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { PigeonMap } from './maps/PigeonMap';

const mapCardSx: SxObject = {
  border: 'none',
};

/**
 * Shows a map card using Pigeon Maps. No lazy loading needed
 * since pigeon-maps is lightweight (~10KB).
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
