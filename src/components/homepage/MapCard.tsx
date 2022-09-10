import useData from '@dg/api/useData';
import ColorSchemeContext from '@dg/components/ColorSchemeContext';
import type { Props as ContentCardProps } from '@dg/components/ContentCard';
import ContentCard from '@dg/components/ContentCard';
import { Maximize2, Minimize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useContext, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

type Props = Pick<ContentCardProps, 'turnOnAnimation'>;
interface IsExpanded {
  $isExpanded: boolean;
}

// In px, the min/max size of the card - matches standard size
const MIN_DIMENSION = 297;

// In px, the height of the expanded card
const EXPANDED_HEIGHT = 600;

// Dynamically imported for loading speed
const Map = dynamic(() => import('@dg/components/maps/Map'), { ssr: false });
const Marker = dynamic(() => import('@dg/components/maps/Marker'), { ssr: false });
const Control = dynamic(() => import('@dg/components/maps/Control'), { ssr: false });

// Changes between two min heights
const Card = styled(ContentCard)<{ $backgroundImageUrl?: string } & IsExpanded>`
  border: none;
  ${({ $isExpanded }) => css`
    min-height: ${$isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION}px;
    @media (max-width: 767.99px) {
      min-height: ${$isExpanded ? 360 : 200}px;
      height: ${$isExpanded ? 360 : 200}px;
    }
  `}
  ${({ $backgroundImageUrl }) =>
    $backgroundImageUrl &&
    css`
      background-image: url('${$backgroundImageUrl}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    `}
`;

/**
 * Shows a canvas-based map of my current location.
 */
const MapCard = ({ turnOnAnimation }: Props) => {
  const { data: location } = useData('location');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMapLoaded, setHasMapLoaded] = useState(false);
  const { colorScheme } = useContext(ColorSchemeContext);
  const backgroundImageUrl =
    colorScheme === 'light' ? location?.backupImageUrls.light : location?.backupImageUrls.dark;
  const expansionControl = useMemo(
    () => (
      <Control onClick={isExpanded ? () => setIsExpanded(false) : undefined} position="top-right">
        {isExpanded ? <Minimize2 size="1em" /> : <Maximize2 size="1em" />}
      </Control>
    ),
    [isExpanded],
  );

  return (
    <Card
      $isExpanded={isExpanded}
      onExpansion={!isExpanded ? setIsExpanded : undefined}
      $backgroundImageUrl={!hasMapLoaded ? backgroundImageUrl : undefined}
      turnOnAnimation={turnOnAnimation}
    >
      {location?.point && (
        <Map
          location={location}
          isExpanded={isExpanded}
          isLoaded={hasMapLoaded}
          setMapHasLoaded={() => setHasMapLoaded(true)}
        >
          {expansionControl}
          <Marker key="home" point={location.point} image={location.image} />
        </Map>
      )}
    </Card>
  );
};

export default MapCard;
