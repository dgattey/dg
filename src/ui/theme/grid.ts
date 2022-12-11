import { ThemeOptions } from '@mui/material';

/**
 * Sets up the spacing features for the grid
 */
export function getGrid() {
  const grid: ThemeOptions['grid'] = {
    gap: 2,
    gapLarge: 3.35,
    contentDimension: 16.5,
    cardSizeInRem: undefined, // set below
  };

  /**
   * Creates a card size in rem from a span
   */
  grid.cardSizeInRem = (span = 1) =>
    `${grid.contentDimension * span + (span - 1) * grid.gapLarge}rem`;

  return grid;
}
