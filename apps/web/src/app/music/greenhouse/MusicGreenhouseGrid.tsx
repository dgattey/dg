import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import styles from '../../greenhouse/greenhouse.module.css';

const SLOTS = ['intro', 'now-playing', 'albums', 'history', 'tracks', 'artists'] as const;

type Slot = (typeof SLOTS)[number];

type Props = {
  intro: ReactNode;
  nowPlaying: ReactNode;
  albums?: ReactNode;
  history?: ReactNode;
  tracks?: ReactNode;
  artists?: ReactNode;
};

const cellLayout = (slot: Slot): SxObject => {
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
    case 'history':
      return {
        gridColumn: '1 / -1',
        gridRow: { xl: '3', xs: 'auto' },
      };
    case 'tracks':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { xl: '4', xs: 'auto' },
      };
    case 'artists':
      return {
        gridColumn: { md: 'span 6', xs: '1 / -1' },
        gridRow: { xl: '4', xs: 'auto' },
      };
  }
};

/**
 * 12-col music greenhouse. Named slots so a missing on-repeat / list card
 * does not shift later cells. Desktop is intro 4 + landscape hero 8, on-repeat
 * full width, listening history full width, then tracks 6 / artists 6.
 */
export function MusicGreenhouseGrid({
  intro,
  nowPlaying,
  albums,
  history,
  tracks,
  artists,
}: Props) {
  const slotted: Record<Slot, ReactNode> = {
    albums,
    artists,
    history,
    intro,
    'now-playing': nowPlaying,
    tracks,
  };

  return (
    <Box className={styles.grid} data-greenhouse-grid="music">
      {SLOTS.map((slot) => {
        const child = slotted[slot];
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
