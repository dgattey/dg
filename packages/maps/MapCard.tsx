import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { getTileSource } from './src/getTileSource';
import { PigeonMap } from './src/PigeonMap';

/**
 * Server component wrapper for the map. Resolves the tile source
 * server-side and passes it to the client PigeonMap component.
 */
export function MapCard({ location }: { location: MapLocation }) {
  return (
    <section aria-label="Current location map" data-map-card="">
      <PigeonMap location={location} tileSource={getTileSource()} />
    </section>
  );
}
