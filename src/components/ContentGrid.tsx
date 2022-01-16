import styled from 'styled-components';

/**
 * Auto fits densely to properly fill in all gaps at every size. Use
 * of auto on smallest screens means the items will fill the screen instead
 * of being small in the center. Once we hit tablet, we swap to using static
 * widths for our columns to allow 3 or more on bigger screens
 */
const Grid = styled.div`
  display: grid;
  gap: var(--content-grid-gap-em);
  grid-template-columns: repeat(auto-fit, auto);
  grid-auto-flow: dense;
  justify-content: center;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, var(--content-grid-dimension-em));
  }
`;

/**
 * Displays all our content in a grid
 */
const ContentGrid = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <Grid>{children}</Grid>
);

export default ContentGrid;
