import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Children } from 'react';
import styles from '../../greenhouse/greenhouse.module.css';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

const SLOTS = ['now-playing', 'albums', 'tracks', 'artists'] as const;

const cellLayout = (slot: (typeof SLOTS)[number]): SxObject => {
  switch (slot) {
    case 'now-playing':
      return {
        gridColumn: { md: '1 / -1', xl: 'span 8', xs: '1 / -1' },
        gridRow: { md: '1', xl: '1', xs: 'auto' },
      };
    case 'albums':
      return {
        gridColumn: { md: '1 / -1', xl: 'span 4', xs: '1 / -1' },
        gridRow: { md: '2', xl: '1', xs: 'auto' },
      };
    case 'tracks':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { md: '3', xl: '2', xs: 'auto' },
      };
    case 'artists':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { md: '3', xl: '2', xs: 'auto' },
      };
  }
};

/**
 * 12-col music greenhouse. Desktop is now-playing 8 + albums 4, then tracks
 * 6 / artists 6. Tablet stacks the hero and albums, then pairs the lists.
 * Extra children (the albums route does not use this grid) go full-bleed.
 *
 * Reuses the shared `.grid` / `.cell` paint from `GreenhouseGrid` without
 * editing that home-specific slot map.
 */
export function MusicGreenhouseGrid({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <Box className={styles.grid} data-greenhouse-grid="music">
      {SLOTS.map((slot, index) => {
        const child = items[index];
        if (!child) {
          return null;
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
