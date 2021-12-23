import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  gap: var(--content-grid-gap-em);
  grid-auto-rows: 1fr;
  grid-auto-columns: 1fr;
  grid-template-columns: repeat(auto-fit, var(--content-grid-dimension-em));
  grid-template-rows: repeat(auto-fit, var(--content-grid-dimension-em));
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
