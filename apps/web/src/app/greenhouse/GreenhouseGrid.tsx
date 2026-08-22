import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

const cellSx: SxObject = {
  alignSelf: 'stretch',
  boxSizing: 'border-box',
  justifySelf: 'stretch',
  maxWidth: 'none',
  minWidth: 0,
  width: '100%',
};

const cell = (slot: 'activity' | 'featured' | 'intro' | 'now-playing'): SxObject => ({
  [`& > [data-bento="${slot}"], & > :has([data-bento="${slot}"])`]: {
    ...cellSx,
    ...(slot === 'intro' ? { overflow: 'visible' } : null),
    gridColumn: {
      sm: slot === 'activity' || slot === 'intro' ? '1' : '2',
    },
    gridRow: {
      sm: slot === 'intro' || slot === 'now-playing' ? '1' : '2',
    },
    minHeight: {
      sm: slot === 'intro' ? '40vh' : '13.5rem',
      xs: 'auto',
    },
  },
});

/**
 * Even 2×2 for the greenhouse homepage. Rows size to content so all four
 * cards fit under a 1440×900 fold. Gutters come from `--greenhouse-gutter`.
 * Single column under 576px (`sm`). No mosaic nudges.
 */
export function GreenhouseGrid({ children }: Props) {
  const gridSx: SxObject = {
    ...cell('activity'),
    ...cell('featured'),
    ...cell('intro'),
    ...cell('now-playing'),
    display: 'grid',
    gap: 'var(--greenhouse-gutter, 1.25rem)',
    gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' },
    gridTemplateRows: { sm: 'auto auto', xs: 'auto' },
    marginInline: 'auto',
    maxWidth: '68rem',
    position: 'relative',
    width: '100%',
  };
  return (
    <Box data-greenhouse-grid={true} sx={gridSx}>
      {children}
    </Box>
  );
}
