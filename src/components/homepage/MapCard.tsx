import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import { Expand, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styled, { css } from 'styled-components';

interface IsExpanded {
  $isExpanded: boolean;
}

// In px, the min/max size of the card - matches standard size
const MIN_DIMENSION = 297;

// In px, the height of the expanded card
const EXPANDED_HEIGHT = 600;

// Dynamically imported for loading speed
const Map = dynamic(() => import('components/maps/Map'), { ssr: false });
const Marker = dynamic(() => import('components/maps/Marker'), { ssr: false });
const Control = dynamic(() => import('components/maps/Control'), { ssr: false });

// Changes between two min heights
const Card = styled(ContentCard)<{ $backgroundImageUrl?: string } & IsExpanded>`
  border: none;
  ${({ $isExpanded }) => css`
    min-height: ${$isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION}px;
    @media (max-width: 767.99px) {
      height: 400px;
      min-height: 400px;
    }
  `}
  ${({ $backgroundImageUrl }) =>
    $backgroundImageUrl &&
    css`
      background-image: url('${$backgroundImageUrl}');
      background-repeat: no-repeat;
      background-size: cover;
    `}
`;
const HIDDEN_ON_MOBILE = css`
  visibility: hidden;
  @media (min-width: 768px) {
    visibility: visible;
  }
`;

const ExpandButton = styled(Control)`
  ${HIDDEN_ON_MOBILE}
`;

/**
 * Shows a canvas-based map of my current location.
 */
const MapCard = () => {
  const { data: location } = useData('location');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      $isExpanded={isExpanded}
      onExpansion={!isExpanded ? setIsExpanded : undefined}
      $backgroundImageUrl={location?.backupImageUrl}
    >
      {location?.point && (
        <Map location={location} isExpanded={isExpanded}>
          <ExpandButton
            onClick={isExpanded ? () => setIsExpanded(false) : undefined}
            position="top-right"
          >
            {isExpanded ? <X size="1em" /> : <Expand size="1em" />}
          </ExpandButton>
          <Marker key="home" point={location.point} image={location.image} />
        </Map>
      )}
    </Card>
  );
};

export default MapCard;
