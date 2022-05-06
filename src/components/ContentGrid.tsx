import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// In ms, how long to animate grid items
export const GRID_ANIMATION_DURATION = 300;

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
 * Swaps pointer events between being disabled and auto on the children to
 * avoid slowdowns as the browser tries to compute a hover effect as it
 * animates.
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
  const gridRef = useRef<HTMLDivElement>(null);
  const hasBeenAnimated = useRef(false);

  /**
   * Uses refs so we can be sure that we wrap the grid with animations exactly once.
   * Imports the animation library (and this is called from an effect) so we don't
   * do that on the server where it's unneeded.
   */
  const importAnimationLibAndWrapGrid = async () => {
    if (!gridRef.current) {
      hasBeenAnimated.current = false;
      return;
    }
    if (hasBeenAnimated.current) {
      return;
    }
    hasBeenAnimated.current = true;
    try {
      const { wrapGrid } = await import('animate-css-grid');

      wrapGrid(gridRef.current, {
        stagger: 10,
        duration: GRID_ANIMATION_DURATION,
        easing: 'backOut',
        onStart: changePointerEvents(false),
        onEnd: changePointerEvents(true),
      });
    } catch {
      hasBeenAnimated.current = false;
    }
  };

  // Make sure we import the animation lib and wrap the grid with animations once
  useEffect(() => {
    (() => importAnimationLibAndWrapGrid())();
  }, []);

  return <Grid ref={gridRef}>{children}</Grid>;
};

export default ContentGrid;
