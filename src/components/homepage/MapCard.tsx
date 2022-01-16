import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import { useState } from 'react';
import MapGL from 'react-map-gl';
import styled from 'styled-components';

const StyledMap = styled(MapGL)`
  & .mapboxgl-canvas {
    border-radius: var(--border-radius);
  }
`;

const MapCard = () => {
  const { data: location } = useData('myLocation');
  const [viewport, setViewport] = useState({
    latitude: location?.lat,
    longitude: location?.lon,
    zoom: 9,
    bearing: 0,
    pitch: 0,
  });

  return (
    <ContentCard>
      <StyledMap
        {...viewport}
        attributionControl={false}
        width="100%"
        height="100%"
        scrollZoom={false}
        minZoom={4}
        maxZoom={11}
        mapOptions={{ cooperativeGestures: true }}
        mapStyle="mapbox://styles/dylangattey/ckyfpsonl01w014q8go5wvnh2?optimize=true"
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      />
    </ContentCard>
  );
};

export default MapCard;
