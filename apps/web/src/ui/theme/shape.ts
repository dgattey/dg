import { ThemeOptions } from '@mui/material';

/**
 * Sets up the spacing features for the grid in rem units
 */
export function getShape() {
  const shape: ThemeOptions['shape'] = {
    gridGap: 2,
    gridGapLarge: 3.35,
    gridItemDimension: 16.5,
    gridItemSize: undefined, // set below
  };

  /**
   * Creates a card size in rem from a span
   */
  shape.gridItemSize = (span = 1) =>
    `${shape.gridItemDimension * span + (span - 1) * shape.gridGapLarge}rem`;

  return shape;
}
