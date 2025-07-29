import type { MapLocation } from 'api/contentful/MapLocation';
import { useState } from 'react';
import { MapboxMap } from './MapboxMap';
import { Marker } from './Marker';

type FullMapCardProps = {
  location: MapLocation;
};

/**
 * Shows a canvas-based map of my current location. This should be imported ON DEMAND
 * as the mapbox maps are absolutely massive so we should delay as long as possible.
 */
function FullMapCard({ location }: FullMapCardProps) {
  const [hasMapLoaded, setHasMapLoaded] = useState(false);

  return location.point ? (
    <MapboxMap
      isLoaded={hasMapLoaded}
      location={location}
      setMapHasLoaded={() => {
        setHasMapLoaded(true);
      }}
    >
      <Marker image={location.image} key="home" point={location.point} />
    </MapboxMap>
  ) : null;
}

// Enables dynamic import - needs to be default
export default FullMapCard;
