import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Children } from 'react';
import styles from '../../greenhouse/greenhouse.module.css';

type Props = Pick<React.ComponentProps<'div'>, 'children'>;

const SLOTS = ['intro', 'now-playing', 'albums', 'tracks', 'artists'] as const;

const cellLayout = (slot: (typeof SLOTS)[number]): SxObject => {
  switch (slot) {
    case 'intro':
      return {
        alignSelf: { xl: 'end', xs: 'auto' },
        gridColumn: { xl: 'span 4', xs: '1 / -1' },
        gridRow: { xl: '1', xs: 'auto' },
      };
    case 'now-playing':
      return {
        aspectRatio: { sm: '2.4 / 1' },
        gridColumn: { xl: 'span 8', xs: '1 / -1' },
        gridRow: { xl: '1', xs: 'auto' },
        minHeight: { sm: 'unset', xs: '16.5rem' },
      };
    case 'albums':
      return {
        gridColumn: '1 / -1',
        gridRow: { xl: '2', xs: 'auto' },
      };
    case 'tracks':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { xl: '3', xs: 'auto' },
      };
    case 'artists':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { xl: '3', xs: 'auto' },
      };
  }
};

/**
 * 12-col music greenhouse. Desktop is intro 4 + landscape hero 8, on-repeat
 * full width, then tracks 6 / artists 6. Does not use the home `.nowPlaying`
 * 75cqi min-height — that cell is a portrait tile.
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
        return (
          <Box className={styles.cell} data-greenhouse-cell={slot} key={slot} sx={cellLayout(slot)}>
            {child}
          </Box>
        );
      })}
    </Box>
  );
}
