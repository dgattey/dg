import styled from 'styled-components';

// Auto fits densely to properly fill in all gaps at every size. Means that things will jump around a bit
const Grid = styled.div`
  display: grid;
  gap: var(--content-grid-gap-em);
  grid-template-columns: repeat(auto-fit, var(--content-grid-dimension-em));
  grid-auto-flow: dense;
  justify-content: center;
`;

/**
 * Displays all our content in a grid
 */
const ContentGrid = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <Grid>{children}</Grid>
);

export default ContentGrid;
