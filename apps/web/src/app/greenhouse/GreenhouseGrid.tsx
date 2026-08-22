import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { GREENHOUSE_GRID_SPANS } from './greenhouseGeometry';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;
type Slot = keyof typeof GREENHOUSE_GRID_SPANS;

const cellSx: SxObject = {
  alignSelf: 'stretch',
  boxSizing: 'border-box',
  justifySelf: 'stretch',
  maxWidth: 'none',
  minWidth: 0,
  width: '100%',
};

const nowPlayingSx: SxObject = {
  alignSelf: { sm: 'start', xs: 'stretch' },
  containerType: { sm: 'inline-size' },
  height: { sm: '100%' },
  maxHeight: { sm: '160cqi' },
  minHeight: { sm: '75cqi' },
};

const cell = (slot: Slot): SxObject => ({
  [`& > [data-bento="${slot}"], & > :has([data-bento="${slot}"])`]: {
    ...cellSx,
    ...(slot === 'intro' ? { overflow: 'visible' } : null),
    ...(slot === 'now-playing' ? nowPlayingSx : null),
    gridColumn: {
      sm: `span ${GREENHOUSE_GRID_SPANS[slot].span}`,
      xs: '1',
    },
    gridRow: {
      sm: slot === 'intro' || slot === 'now-playing' ? '1' : '2',
      xs: 'auto',
    },
    minHeight: {
      sm: slot === 'now-playing' ? '75cqi' : slot === 'intro' ? 'auto' : '13.5rem',
      xs: 'auto',
    },
  },
});

/**
 * 12-col greenhouse homepage. Rows size to content so all four cards
 * fit under a 1440×900 fold. Gutters come from `--greenhouse-gutter`.
 * Single column under 576px (`sm`).
 */
export function GreenhouseGrid({ children }: Props) {
  const gridSx: SxObject = {
    ...cell('activity'),
    ...cell('featured'),
    ...cell('intro'),
    ...cell('now-playing'),
    alignItems: 'stretch',
    display: 'grid',
    gap: 'var(--greenhouse-gutter, 1.25rem)',
    gridAutoRows: 'auto',
    gridTemplateColumns: { sm: 'repeat(12, minmax(0, 1fr))', xs: '1fr' },
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
