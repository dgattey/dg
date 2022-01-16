import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import { useEffect, useRef, useState } from 'react';
import { Map, MapRef, ViewState } from 'react-map-gl';
import styled, { css } from 'styled-components';

interface Props {
  /**
   * Full width of the grid this card sits in, if known
   */
  gridWidth: number | null;
}

// In px, the min/max size of the card - matches standard size
const MIN_DIMENSION = 320;

// In px, the height of the expanded card
const EXPANDED_HEIGHT = 600;

// Changes between two min heights
const Card = styled(ContentCard)<{ $height: number }>`
  ${({ $height }) =>
    css`
      min-height: ${$height}px;
    `};
`;

// This wrapper fits the MAX size this card will ever be so the map can statically stay that size
const Wrapper = styled.div<{ $maxWidth: number }>`
  height: ${EXPANDED_HEIGHT}px;
  width: ${({ $maxWidth }) => $maxWidth}px;
  position: relative;
  & .mapboxgl-ctrl {
    margin: 2rem;
  }
`;

/**
 * Uses Mapbox to show a canvas-based map of my current location.
 */
const MapCard = ({ gridWidth }: Props) => {
  const { data: location } = useData('myLocation');
  const mapRef = useRef<MapRef>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(MIN_DIMENSION);

  const [viewState, setViewState] = useState<ViewState & { width: number; height: number }>({
    latitude: location?.lat ?? 0,
    longitude: location?.lon ?? 0,
    zoom: 9,
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    width: gridWidth ?? MIN_DIMENSION,
    height: EXPANDED_HEIGHT,
    bearing: 0,
    pitch: 0,
  });

  // When expansion state changes, set height and view state
  useEffect(() => {
    setHeight(isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION);
    setViewState((currentState) => ({
      ...currentState,
      width: gridWidth ?? MIN_DIMENSION,
      height: EXPANDED_HEIGHT,
      padding: {
        left: 0,
        top: 0,
        right: isExpanded || !gridWidth ? 0 : gridWidth - MIN_DIMENSION,
        bottom: isExpanded ? 0 : EXPANDED_HEIGHT - MIN_DIMENSION,
      },
    }));
  }, [gridWidth, isExpanded]);

  return (
    <Card onExpansion={setIsExpanded} $height={height}>
      <Wrapper $maxWidth={gridWidth ?? 0}>
        <Map
          ref={mapRef}
          viewState={viewState}
          scrollZoom={false}
          dragRotate={false}
          dragPan={false}
          touchZoomRotate={false}
          touchPitch={false}
          doubleClickZoom={false}
          attributionControl={false}
          logoPosition="bottom-right"
          interactive
          mapStyle="mapbox://styles/dylangattey/ckyfpsonl01w014q8go5wvnh2?optimize=true"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        />
      </Wrapper>
    </Card>
  );
};

export default MapCard;
