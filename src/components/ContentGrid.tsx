import styled from 'styled-components';

// In rem, how big each card in the content grid is
const CONTENT_GRID_DIMENSION = 16;

// In rem, how big the gap between cards is
const CONTENT_GRID_GAP = 3.75;

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
  grid-template-columns: repeat(auto-fit, auto);
  grid-auto-flow: dense;
  justify-content: center;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, var(--content-grid-dimension));
  }
`;

/**
 * Displays all our content in a grid
 */
const ContentGrid = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <Grid>{children}</Grid>
);

export default ContentGrid;
