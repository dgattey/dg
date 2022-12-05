import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ContentCard } from 'components/ContentCard';

// In px, the min/max size of the card - matches standard size
const MIN_DIMENSION = 297;

// In px, the height of the expanded card
const EXPANDED_HEIGHT = 600;

type MapContentCardProps = {
  isExpanded?: boolean;
  backgroundImageUrl: string | null;
};

/**
 * MapContentCard is a styled ContentCard that has a background image and
 * expandable support.
 */
export const MapContentCard = styled(ContentCard)<MapContentCardProps>(
  ({ isExpanded, backgroundImageUrl }) => css`
    border: none;
    min-height: ${isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION}px;
    @media (max-width: 767.99px) {
      min-height: ${isExpanded ? 360 : 200}px;
      height: ${isExpanded ? 360 : 200}px;
    }
    ${backgroundImageUrl &&
    css`
      background-image: url('${backgroundImageUrl}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    `}
  `,
);
