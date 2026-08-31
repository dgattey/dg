import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { getTileSource } from './src/getTileSource';
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

/**
 * Server component wrapper for the map. Resolves the tile source
 * server-side and passes it to the client PigeonMap component.
 */
export function MapCard(props: MapCardProps) {
  const { location } = props;
  if (!location) {
    return <ContentCard sx={mapCardSx} verticalSpan={1} />;
  }

  if (props.surface === 'collage') {
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
