import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  '& > div': { height: '100%' },
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

export function MapCard({ location, surface = 'classic' }: MapCardProps) {
  if (!location) {
    if (surface === 'collage') {
      return <Box aria-label="Map unavailable" role="region" sx={collageMapSx} />;
    }
    return <ContentCard sx={mapCardSx} verticalSpan={1} />;
  }

  const stadiaApiKey = process.env.STADIA_API_KEY ?? '';

  if (surface === 'collage') {
    return (
      <Box aria-label="Current location map" role="region" sx={collageMapSx}>
        <PigeonMap location={location} stadiaApiKey={stadiaApiKey} surface="collage" />
      </Box>
    );
  }

  return (
    <ContentCard sx={mapCardSx} verticalSpan={1}>
      <PigeonMap location={location} stadiaApiKey={stadiaApiKey} surface="classic" />
    </ContentCard>
  );
}
