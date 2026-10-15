const CARD_BORDER_RADIUS_PX = 32;

export type ThemeShape = {
  cardBorderRadius: number;
  gridGap: number;
  gridGapLarge: number;
  gridItemDimension: number;
  gridItemSize: (span?: number) => string;
};

export function getShape(): ThemeShape {
  const cardBorderRadius = CARD_BORDER_RADIUS_PX;
  const gridGap = 2;
  const gridGapLarge = 3.65;
  const gridItemDimension = 17.25;

  return {
    cardBorderRadius,
    gridGap,
    gridGapLarge,
    gridItemDimension,
    gridItemSize: (span = 1) => `${gridItemDimension * span + (span - 1) * gridGapLarge}rem`,
  };
}
