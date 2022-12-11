import { Box } from '@mui/material';

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
 * Creates a card size in rem from a span
 */
export const cardSize = (span = 1) =>
  `${CONTENT_GRID_DIMENSION * span + (span - 1) * CONTENT_GRID_GAP}rem`;

/**
 * Displays all our content in a grid - on the client it uses `animate-css-grid`
 * for nice animations when items change in size, which we do when expanding cards.
 *
 * Auto fits densely to properly fill in all gaps at every size. Use
 * of auto on smallest screens means the items will fill the screen instead
 * of being small in the center. Once we hit tablet, we swap to using static
 * widths for our columns to allow 3 or more on bigger screens.
 */
export function ContentGrid({ children, gridRef }: Props) {
  return (
    <Box
      ref={gridRef}
      sx={(theme) => ({
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: '1fr',
        gridAutoFlow: 'dense',
        justifyContent: 'center',
        position: 'relative',
        [theme.breakpoints.up('md')]: {
          gap: `${CONTENT_GRID_GAP}rem`,
          gridTemplateColumns: `repeat(auto-fit, ${CONTENT_GRID_DIMENSION}rem)`,
          gridAutoRows: `minmax(${CONTENT_GRID_DIMENSION}rem, auto)`,
        },
      })}
    >
      {children}
    </Box>
  );
}
