import { Box } from '@mui/material';
import type { SxObject } from '../theme';
import { getShape } from '../theme/shape';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

/**
 * Displays all our content in a grid.
 *
 * Auto fits densely to properly fill in all gaps at every size. Use
 * of auto on smallest screens means the items will fill the screen instead
 * of being small in the center. Once we hit tablet, we swap to using static
 * widths for our columns to allow 3 or more on bigger screens.
 */
export function ContentGrid({ children }: Props) {
  const { gridGap, gridGapLarge, gridItemDimension } = getShape();
  const gridSx: SxObject = {
    display: 'grid',
    gap: { md: `${gridGapLarge}rem`, xs: `${gridGap}rem` },
    gridAutoFlow: 'dense',
    gridAutoRows: { md: `minmax(${gridItemDimension}rem, auto)` },
    gridTemplateColumns: { md: `repeat(auto-fit, ${gridItemDimension}rem)`, xs: '1fr' },
    justifyContent: 'center',
    marginTop: -4,
    position: 'relative',
  };
  return <Box sx={gridSx}>{children}</Box>;
}
