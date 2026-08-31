import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
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

type MapCardProps =
  | { location: MapLocation; surface: 'collage' }
  | { location: MapLocation | null | undefined; surface?: 'classic' };

export function MapCard(props: MapCardProps) {
  const { location } = props;
  if (!location) {
    return <ContentCard sx={mapCardSx} verticalSpan={1} />;
  }

  const stadiaApiKey = process.env.STADIA_API_KEY ?? '';

  if (props.surface === 'collage') {
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
