import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { getTileSource } from './src/getTileSource';
import { PigeonMap } from './src/PigeonMap';

const collageMapSx: SxObject = {
  height: '100%',
  minHeight: 0,
  width: '100%',
};

/**
 * Server component wrapper for the map. Resolves the tile source
 * server-side and passes it to the client PigeonMap component.
 */
export function MapCard({ location }: { location: MapLocation }) {
  return (
    <Box aria-label="Current location map" role="region" sx={collageMapSx}>
      <PigeonMap location={location} tileSource={getTileSource()} />
    </Box>
  );
}
