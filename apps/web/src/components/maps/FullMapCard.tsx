import { Maximize2, Minimize2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material';
import type { ContentCardProps } from 'components/ContentCard';
import { Map } from 'components/maps/Map';
import { Marker } from 'components/maps/Marker';
import { Control } from 'components/maps/Control';
import type { MapLocation } from 'api/types/MapLocation';
import { MapContentCard } from './MapContentCard';

type FullMapCardProps = Pick<ContentCardProps, 'turnOnAnimation'> & {
  location: MapLocation;
  backgroundImageUrl: string | null;
};

/**
 * Shows a canvas-based map of my current location. This should be imported ON DEMAND
 * as the mapbox maps are absolutely massive so we should delay as long as possible.
 */
function FullMapCard({ turnOnAnimation, location, backgroundImageUrl }: FullMapCardProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const expansionControl = useMemo(
    () => (
      <Control
        onClick={
          isExpanded
            ? () => {
                setIsExpanded(false);
              }
            : undefined
        }
        position="top-right"
        theme={theme}
      >
        {isExpanded ? <Minimize2 size="1em" /> : <Maximize2 size="1em" />}
      </Control>
    ),
    [isExpanded, theme],
  );

  return (
    <MapContentCard
      backgroundImageUrl={backgroundImageUrl}
      isExpanded={isExpanded}
      onExpansion={!isExpanded ? setIsExpanded : undefined}
      turnOnAnimation={turnOnAnimation}
    >
      {location.point ? (
        <Map
          isExpanded={isExpanded}
          isLoaded={hasMapLoaded}
          location={location}
          setMapHasLoaded={() => {
            setHasMapLoaded(true);
          }}
        >
          {expansionControl}
          <Marker image={location.image} key="home" point={location.point} />
        </Map>
      ) : null}
    </MapContentCard>
  );
}

// Enables dynamic import - needs to be default
// eslint-disable-next-line import/no-default-export
export default FullMapCard;
