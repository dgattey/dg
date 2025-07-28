import type { MapLocation } from 'api/contentful/MapLocation';
import { useState } from 'react';
import { Map } from './Map';
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
    <Map
      isLoaded={hasMapLoaded}
      location={location}
      setMapHasLoaded={() => {
        setHasMapLoaded(true);
      }}
    >
      <Marker image={location.image} key="home" point={location.point} />
    </Map>
  ) : null;
}

// Enables dynamic import - needs to be default
// eslint-disable-next-line import/no-default-export
export default FullMapCard;
