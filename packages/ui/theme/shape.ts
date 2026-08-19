import type { ThemeOptions } from '@mui/material';

const CARD_BORDER_RADIUS_PX = 32;
const CARD_PADDING_PX = 24;

export function getShape() {
  const shape: ThemeOptions['shape'] = {
    cardBorderRadius: CARD_BORDER_RADIUS_PX,
    cardPadding: CARD_PADDING_PX,
    gridGap: 2,
    gridGapLarge: 3.65,
    gridItemDimension: 17.25,
    gridItemMinSize: 15.5,
    gridItemSize: undefined, // set below
  };

  /**
   * Creates a card size in rem from a span
   */
  shape.gridItemSize = (span = 1) =>
    `${shape.gridItemDimension * span + (span - 1) * shape.gridGapLarge}rem`;

  return shape;
}
