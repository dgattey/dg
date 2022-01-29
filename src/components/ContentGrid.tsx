import React, { useState } from 'react';
import styled from 'styled-components';

// In ms, how long to animate grid items
export const GRID_ANIMATION_DURATION = 300;

// In rem, how big each card in the content grid is
const CONTENT_GRID_DIMENSION = 16.5;

// In rem, how big the gap between cards is
const CONTENT_GRID_GAP = 3.5;

/**
 * Creates a card size in rem from a span
 */
export const cardSize = (span = 1) =>
  `${CONTENT_GRID_DIMENSION * span + (span - 1) * CONTENT_GRID_GAP}rem`;

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
 * Swaps pointer events between being disabled and auto on the children
 */
const changePointerEvents = (isOn: boolean) => (animatedChildren: HTMLElement[]) => {
  animatedChildren.forEach((child) => {
    // eslint-disable-next-line no-param-reassign
    child.style.pointerEvents = isOn ? 'auto' : 'none';
  });
};

/**
 * Displays all our content in a grid - on the client it uses `animate-css-grid`
 * for nice animations when items change in size, which we do when expanding cards.
 */
const ContentGrid = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => {
  const [hasBeenAnimated, setHasBeenAnimated] = useState(false);

  // Async imports the animation library and wraps the grid if we're on the client & it hasn't been wrapped
  const animateGrid = async (grid: HTMLDivElement | null) => {
    if (hasBeenAnimated || !grid || !('window' in global)) {
      return;
    }
    setHasBeenAnimated(true);
    const { wrapGrid } = await import('animate-css-grid');
    if (!hasBeenAnimated) {
      wrapGrid(grid, {
        stagger: 10,
        duration: GRID_ANIMATION_DURATION,
        easing: 'backOut',
        onStart: changePointerEvents(false),
        onEnd: changePointerEvents(true),
      });
    }
  };

  return <Grid ref={animateGrid}>{children}</Grid>;
};

export default ContentGrid;
