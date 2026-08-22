import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Children } from 'react';
import styles from './greenhouse.module.css';
import { GREENHOUSE_GRID_SPANS } from './greenhouseGeometry';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;
type Slot = keyof typeof GREENHOUSE_GRID_SPANS;

const SLOTS = [
  'intro',
  'now-playing',
  'activity',
  'featured',
] as const satisfies ReadonlyArray<Slot>;

const cellLayout = (slot: Slot): SxObject => ({
  gridColumn: {
    sm: `span ${GREENHOUSE_GRID_SPANS[slot].span}`,
    xs: '1 / -1',
  },
  gridRow: {
    sm: slot === 'intro' || slot === 'now-playing' ? '1' : '2',
    xs: 'auto',
  },
  minHeight: {
    sm: slot === 'activity' || slot === 'featured' ? '13.5rem' : 'auto',
    xs: 'auto',
  },
});

/**
 * 12-col greenhouse homepage. Cells are wrappers we own: `cqi` is 1% of
 * the now-playing column, not the viewport, and ContentCard's 1-col rem
 * width cannot size the track.
 */
export function GreenhouseGrid({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <Box className={styles.grid} data-greenhouse-grid={true}>
      {items.map((child, index) => {
        const slot = SLOTS[index];
        if (!slot) {
          return child;
        }
        const className =
          slot === 'now-playing' ? `${styles.cell} ${styles.nowPlaying}` : styles.cell;
        return (
          <Box className={className} data-greenhouse-cell={slot} key={slot} sx={cellLayout(slot)}>
            {child}
          </Box>
        );
      })}
    </Box>
  );
}
