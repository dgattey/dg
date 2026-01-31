import { PROJECT_2X_IMAGE_SIZES, PROJECT_IMAGE_SIZES } from './imageSizes';

/**
 * Returns image sizes based on layout spans.
 */
export function useCurrentImageSizes(layout?: string) {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const sizes = horizontalSpan === 1 ? PROJECT_IMAGE_SIZES : PROJECT_2X_IMAGE_SIZES;
  const width = sizes.extraLarge;
  const height = sizes.extraLarge;
  return {
    height,
    horizontalSpan,
    sizes,
    verticalSpan,
    width,
  };
}
