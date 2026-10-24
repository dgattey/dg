import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import type { CSSProperties } from 'react';
import { getTileSource } from './src/getTileSource';
import { PigeonMap } from './src/PigeonMap';

const collageMapStyle: CSSProperties = {
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
    <section aria-label="Current location map" style={collageMapStyle}>
      <PigeonMap location={location} tileSource={getTileSource()} />
    </section>
  );
}
