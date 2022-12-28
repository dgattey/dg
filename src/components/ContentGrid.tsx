import { Box } from '@mui/material';

type Props = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * A ref to assign to the main grid, for use in animating
   */
  gridRef: React.RefObject<HTMLDivElement>;
};

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
        marginTop: -4,
        display: 'grid',
        gap: `${theme.shape.gridGap}rem`,
        gridTemplateColumns: '1fr',
        gridAutoFlow: 'dense',
        justifyContent: 'center',
        position: 'relative',
        [theme.breakpoints.up('md')]: {
          gap: `${theme.shape.gridGapLarge}rem`,
          gridTemplateColumns: `repeat(auto-fit, ${theme.shape.gridItemDimension}rem)`,
          gridAutoRows: `minmax(${theme.shape.gridItemDimension}rem, auto)`,
        },
      })}
    >
      {children}
    </Box>
  );
}
