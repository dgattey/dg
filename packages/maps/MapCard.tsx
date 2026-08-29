import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { getTileSource } from './src/getTileSource';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  aspectRatio: { md: 'auto', xs: '2 / 1' },
};

const collageMapSx: SxObject = {
  height: '100%',
  minHeight: 0,
  width: '100%',
};

type MapCardProps = {
  location: MapLocation | null | undefined;
  surface?: SiteSurface;
};

/**
 * Server component wrapper for the map. Resolves the tile source
 * server-side and passes it to the client PigeonMap component.
 */
export function MapCard({ location, surface = 'classic' }: MapCardProps) {
  if (!location) {
    if (surface === 'collage') {
      return <Box aria-label="Map unavailable" role="region" sx={collageMapSx} />;
    }
    return <ContentCard sx={mapCardSx} verticalSpan={1} />;
  }

  if (surface === 'collage') {
    return (
      <Box aria-label="Current location map" role="region" sx={collageMapSx}>
        <PigeonMap location={location} surface="collage" tileSource={getTileSource()} />
      </Box>
    );
  }

  return (
    <ContentCard sx={mapCardSx} verticalSpan={1}>
      <PigeonMap location={location} surface="classic" tileSource={getTileSource()} />
    </ContentCard>
  );
}
