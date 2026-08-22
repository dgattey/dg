import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

/**
 * Even 2×2 for the greenhouse homepage. Gutters come from `--greenhouse-gutter`.
 * Single column under 576px (`sm`). No mosaic nudges.
 */
export function GreenhouseGrid({ children }: Props) {
  const gridSx: SxObject = {
    '& > [data-bento="activity"]': {
      gridColumn: { sm: '1' },
      gridRow: { sm: '2' },
    },
    '& > [data-bento="featured"]': {
      gridColumn: { sm: '2' },
      gridRow: { sm: '2' },
    },
    '& > [data-bento="intro"]': {
      gridColumn: { sm: '1' },
      gridRow: { sm: '1' },
      overflow: 'visible',
    },
    '& > [data-bento="now-playing"]': {
      gridColumn: { sm: '2' },
      gridRow: { sm: '1' },
    },
    '& > *': {
      height: { sm: '100%' },
      maxWidth: 'none',
      minHeight: 0,
      width: '100% !important',
    },
    display: 'grid',
    gap: 'var(--greenhouse-gutter, 1.25rem)',
    gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' },
    gridTemplateRows: { sm: 'minmax(22rem, 1fr) minmax(20rem, 1fr)', xs: 'auto' },
    marginInline: 'auto',
    maxWidth: '68rem',
    position: 'relative',
    width: '100%',
  };
  return <Box sx={gridSx}>{children}</Box>;
}
