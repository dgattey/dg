import type { ThemeOptions } from '@mui/material';

const CARD_BORDER_RADIUS_PX = 32;

export function getShape() {
  const shape: ThemeOptions['shape'] = {
    cardBorderRadius: CARD_BORDER_RADIUS_PX,
    gridGap: 2,
    gridGapLarge: 3.65,
    gridItemDimension: 17.25,
    gridItemSize: undefined, // set below
  };

  /**
   * Creates a card size in rem from a span
   */
  shape.gridItemSize = (span = 1) =>
    `${shape.gridItemDimension * span + (span - 1) * shape.gridGapLarge}rem`;

  return shape;
}
