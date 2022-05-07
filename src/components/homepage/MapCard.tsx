import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import type { Props as MapProps } from 'components/maps/Map';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
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

// Dynamically imported for loading speed
const Map = dynamic(() => import('components/maps/Map'), { ssr: false });
const Marker = dynamic(() => import('components/maps/Marker'), { ssr: false });
const Control = dynamic(() => import('components/maps/Control'), { ssr: false });

// Changes between two min heights
const Card = styled(ContentCard)<{ $height: number; $backgroundImageUrl?: string }>`
  border: 1px solid var(--card-background-color);
  ${({ $height }) =>
    css`
      min-height: ${$height}px;
    `}
  ${({ $backgroundImageUrl }) =>
    $backgroundImageUrl &&
    css`
      background-image: url('${$backgroundImageUrl}');
    `}
`;

// This wrapper fits the MAX size this card will ever be so the map can statically stay that size
const Wrapper = styled.div<{ $maxWidth: number }>`
  height: ${EXPANDED_HEIGHT}px;
  width: ${({ $maxWidth }) => $maxWidth}px;
  position: relative;
`;

/**
 * Shows a canvas-based map of my current location.
 */
const MapCard = ({ gridWidth }: Props) => {
  const { data: location } = useData('location');
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(MIN_DIMENSION);

  const [viewState, setViewState] = useState<MapProps['viewState']>({
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    width: gridWidth ?? MIN_DIMENSION,
    height: EXPANDED_HEIGHT,
  });

  // When expansion state changes, set height and view state
  useEffect(() => {
    setHeight(isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION);
    setViewState({
      width: gridWidth ?? MIN_DIMENSION,
      height: EXPANDED_HEIGHT,
      padding: {
        left: 0,
        top: 0,
        right: isExpanded || !gridWidth ? 0 : gridWidth - MIN_DIMENSION,
        bottom: isExpanded ? 0 : EXPANDED_HEIGHT - MIN_DIMENSION,
      },
    });
  }, [gridWidth, isExpanded]);

  return (
    <Card
      onExpansion={!isExpanded ? setIsExpanded : undefined}
      $height={height}
      $backgroundImageUrl={location?.backupImageUrl}
    >
      <Wrapper $maxWidth={gridWidth ?? 0}>
        {location?.point && (
          <Map location={location} viewState={viewState}>
            <Control onClick={() => setIsExpanded(false)} position="top-right">
              <FiX />
            </Control>
            <Marker key="home" point={location.point} image={location.image} />
          </Map>
        )}
      </Wrapper>
    </Card>
  );
};

export default MapCard;
