import React from 'react';
import styled from 'styled-components';

type Props = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * A ref to assign to the main grid, for use in animating
   */
  gridRef: React.RefObject<HTMLDivElement>;
};

// In rem, how big each card in the content grid is
const CONTENT_GRID_DIMENSION = 16.5;

// In rem, how big the gap between cards is
const CONTENT_GRID_GAP = 3.5;

/**
 * Creates a card size in raw rem value from a span
 */
const cardSizeRaw = (span = 1) => CONTENT_GRID_DIMENSION * span + (span - 1) * CONTENT_GRID_GAP;

/**
 * Creates a card size in px from a span - uses base font size to calculate, but
 * it's not responsive!
 */
export const cardSizeInPx = (span = 1) => cardSizeRaw(span) * 20;

/**
 * Creates a card size in rem from a span
 */
export const cardSize = (span = 1) => `${cardSizeRaw(span)}rem`;

/**
 * Auto fits densely to properly fill in all gaps at every size. Use
 * of auto on smallest screens means the items will fill the screen instead
 * of being small in the center. Once we hit tablet, we swap to using static
 * widths for our columns to allow 3 or more on bigger screens
 */
const Grid = styled.div`
  --content-grid-dimension: ${CONTENT_GRID_DIMENSION}rem;
  --content-grid-gap: ${CONTENT_GRID_GAP}rem;
  display: grid;
  gap: var(--content-grid-gap);
  grid-template-columns: 1fr;
  grid-auto-flow: dense;
  justify-content: center;
  position: relative;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, var(--content-grid-dimension));
    grid-auto-rows: minmax(var(--content-grid-dimension), auto);
  }
`;

/**
 * Displays all our content in a grid - on the client it uses `animate-css-grid`
 * for nice animations when items change in size, which we do when expanding cards.
 */
const ContentGrid = ({ children, gridRef }: Props) => <Grid ref={gridRef}>{children}</Grid>;

export default ContentGrid;
