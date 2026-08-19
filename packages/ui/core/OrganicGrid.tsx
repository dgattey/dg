import { Box } from '@mui/material';
import type { SxObject } from '../theme';
import { getShape } from '../theme/shape';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

/**
 * Content grid that fills available space instead of locking to a fixed
 * column width. Slight per-child margins break the even mosaic without
 * fighting hover transforms on the cards themselves.
 *
 * Mobile stays a single column, matching `ContentGrid`.
 */
export function OrganicGrid({ children }: Props) {
  const { gridGap, gridGapLarge, gridItemMinSize } = getShape();
  const gridSx: SxObject = {
    '& > *': {
      height: { md: '100%' },
      justifySelf: 'stretch',
      maxWidth: { md: 'none !important', xs: '85vw' },
      width: { md: '100% !important', xs: '85vw' },
    },
    '& > *:nth-child(3n)': {
      marginInlineStart: { md: '0.2rem' },
      marginTop: { md: '0.45rem' },
    },
    '& > *:nth-child(3n+1)': {
      marginInlineEnd: { md: '0.35rem' },
      marginTop: { md: '-0.4rem' },
    },
    '& > *:nth-child(3n+2)': {
      marginInlineStart: { md: '-0.2rem' },
      marginTop: { md: '0.55rem' },
    },
    display: 'grid',
    gap: { md: `${gridGapLarge + 0.35}rem`, xs: `${gridGap}rem` },
    gridAutoFlow: 'dense',
    gridAutoRows: { md: `minmax(${gridItemMinSize}rem, auto)` },
    gridTemplateColumns: {
      md: `repeat(auto-fit, minmax(${gridItemMinSize}rem, 1fr))`,
      xs: '1fr',
    },
    justifyContent: 'center',
    marginTop: -4,
    position: 'relative',
  };
  return <Box sx={gridSx}>{children}</Box>;
}
