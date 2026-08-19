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
  const { gridGap, gridGapLarge } = getShape();
  const gridSx: SxObject = {
    '& > [data-bento="activity"], & > *:has([data-bento="activity"])': {
      gridColumn: { md: '1 / span 2' },
      gridRow: { md: '2' },
      minHeight: { md: '13.25rem' },
    },
    '& > [data-bento="featured"], & > *:has([data-bento="featured"])': {
      gridColumn: { md: '3' },
      gridRow: { md: '2' },
    },
    '& > [data-bento="intro"], & > *:has([data-bento="intro"])': {
      gridColumn: { md: '1 / span 2' },
      gridRow: { md: '1' },
      minHeight: { md: '15rem' },
    },
    '& > [data-bento="now-playing"], & > *:has([data-bento="now-playing"])': {
      gridColumn: { md: '3' },
      gridRow: { md: '1' },
    },
    '& > *': {
      height: { md: '100%' },
      justifySelf: 'stretch',
      maxWidth: { md: 'none !important', xs: '85vw' },
      width: { md: '100% !important', xs: '85vw' },
    },
    '& > *:nth-child(3n)': {
      marginInlineStart: { md: '0.35rem' },
      marginTop: { md: '0.45rem' },
    },
    '& > *:nth-child(3n+1)': {
      marginInlineEnd: { md: '0.4rem' },
      marginTop: { md: '0.1rem' },
    },
    '& > *:nth-child(3n+2)': {
      marginInlineStart: { md: '0.15rem' },
      marginTop: { md: '0.35rem' },
    },
    display: 'grid',
    gap: { md: `${gridGapLarge}rem`, xs: `${gridGap}rem` },
    gridAutoFlow: 'dense',
    gridAutoRows: { md: 'auto', xs: 'auto' },
    gridTemplateColumns: {
      md: 'repeat(3, minmax(0, 1fr))',
      xs: '1fr',
    },
    justifyContent: 'center',
    marginTop: -4,
    position: 'relative',
  };
  return <Box sx={gridSx}>{children}</Box>;
}
