import styled from 'styled-components';

// Auto fits above 992px, and kept to two columns for tablet. Mobile is one wide only.
const Grid = styled.div`
  display: grid;
  gap: var(--content-grid-gap-em);
  grid: 1fr;
  justify-content: center;
  @media (min-width: 768px) {
    grid: auto-flow dense / 1fr 1fr;
  }
  @media (min-width: 992px) {
    grid-template-columns: repeat(auto-fit, var(--content-grid-dimension-em));
    grid-template-rows: repeat(auto-fit, var(--content-grid-dimension-em));
  }
`;

/**
 * Displays all our content in a grid
 */
const ContentGrid = ({ children }: Pick<React.ComponentProps<'div'>, 'children'>) => (
  <Grid>{children}</Grid>
);

export default ContentGrid;
