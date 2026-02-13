import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Suspense } from 'react';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  border: 'none',
};

/**
 * Server component wrapper for the map.
 * PigeonMap is a client component wrapped in Suspense for loading state.
 */
export function MapCard({ location }: { location: MapLocation | null | undefined }) {
  if (!location) {
    return <ContentCard sx={mapCardSx} />;
  }

  return (
    <ContentCard sx={mapCardSx}>
      <Suspense fallback={<MapFallback />}>
        <PigeonMap location={location} />
      </Suspense>
    </ContentCard>
  );
}

/**
 * Simple loading fallback that matches the map's dimensions.
 */
function MapFallback() {
  return (
    <div
      style={{
        backgroundColor: 'var(--mui-palette-background-paper)',
        height: '100%',
        width: '100%',
      }}
    />
  );
}
