import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  '& > div': { height: '100%' },
  aspectRatio: { md: 'auto', xs: '2 / 1' },
};

/**
 * Server component wrapper for the map. Reads the Stadia API key
 * server-side and passes it to the client PigeonMap component.
 * PigeonMap renders an underlay image that's visible until tiles load.
 */
export function MapCard({ location }: { location: MapLocation | null | undefined }) {
  if (!location) {
    return <ContentCard sx={mapCardSx} />;
  }

  const stadiaApiKey = process.env.STADIA_API_KEY ?? '';

  return (
    <ContentCard sx={mapCardSx}>
      <PigeonMap location={location} stadiaApiKey={stadiaApiKey} />
    </ContentCard>
  );
}
