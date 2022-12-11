import {
  BREAKPOINTS_MIN_SIZES,
  PROJECT_2X_IMAGE_SIZES,
  PROJECT_IMAGE_SIZES,
} from 'constants/imageSizes';
import { useBreakpoint } from 'use-breakpoint';

/**
 * Grabs the current breakpoint and returns the appropriate image sizes for the current
 * breakpoint and the horizontal and vertical span of the image.
 */
export function useCurrentImageSizes(layout?: string) {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const { breakpoint } = useBreakpoint(BREAKPOINTS_MIN_SIZES, 'extraLarge');
  const width =
    horizontalSpan === 1 ? PROJECT_IMAGE_SIZES[breakpoint] : PROJECT_2X_IMAGE_SIZES[breakpoint];
  const height =
    verticalSpan === 1 ? PROJECT_IMAGE_SIZES[breakpoint] : PROJECT_2X_IMAGE_SIZES[breakpoint];
  const sizes = horizontalSpan === 1 ? PROJECT_IMAGE_SIZES : PROJECT_2X_IMAGE_SIZES;
  return {
    width,
    height,
    horizontalSpan,
    verticalSpan,
    sizes,
  };
}
