import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Children, isValidElement } from 'react';
import styles from './greenhouse.module.css';
import { GREENHOUSE_GRID_SPANS, GREENHOUSE_STACKED_SPANS } from './greenhouseGeometry';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;
type Slot = keyof typeof GREENHOUSE_GRID_SPANS;

const SLOTS = [
  'intro',
  'now-playing',
  'activity',
  'featured',
] as const satisfies ReadonlyArray<Slot>;

const stackedSpan = (slot: Slot): string =>
  slot === 'activity' || slot === 'featured'
    ? `span ${GREENHOUSE_STACKED_SPANS[slot].span}`
    : '1 / -1';

const extraLayout: SxObject = {
  gridColumn: {
    md: 'span 6',
    xl: 'span 4',
    xs: '1 / -1',
  },
  gridRow: 'auto',
  minHeight: 'auto',
};

const cellLayout = (slot: Slot): SxObject => ({
  gridColumn: {
    md: stackedSpan(slot),
    xl: `span ${GREENHOUSE_GRID_SPANS[slot].span}`,
    xs: '1 / -1',
  },
  gridRow: {
    md: slot === 'intro' ? '1' : slot === 'now-playing' ? '2' : '3',
    xl: slot === 'intro' || slot === 'now-playing' ? '1' : '2',
    xs: 'auto',
  },
  minHeight: {
    md: slot === 'activity' || slot === 'featured' ? '13.5rem' : 'auto',
    xs: 'auto',
  },
});

/**
 * 12-col greenhouse homepage. Below `xl` the intro takes the full track so
 * now-playing stays ≥ ~300px. Cells are wrappers we own: `cqi` is 1% of
 * the now-playing column, not the viewport.
 */
export function GreenhouseGrid({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <Box className={styles.grid} data-greenhouse-grid={true}>
      {items.map((child, index) => {
        const slot = SLOTS[index];
        const childKey = isValidElement(child) && child.key != null ? String(child.key) : slot;
        if (!slot) {
          return (
            <Box
              className={styles.cell}
              data-greenhouse-cell={`more-${index}`}
              key={childKey ?? 'extra'}
              sx={extraLayout}
            >
              {child}
            </Box>
          );
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
