import { styled } from '@mui/material';
import NextImage from 'next/image';
import type { Asset } from 'api/contentful/api.generated';
import { BREAKPOINT_MAX_SIZES } from '../helpers/imageSizes';

type ImageProps = Partial<Asset> & {
  url: Asset['url'];
  width: Asset['width'];
  height: Asset['height'];
  fill?: boolean;

  /**
   * Alt text, required, but defaults to title
   */
  alt: string;

  /**
   * For the image that should be the LCP
   */
  priority?: boolean;

  /**
   * Sizes are required and map from breakpoint to image width so
   * Next can automatically generate us some well-sized images!
   */
  sizes: {
    /**
     * Under 576px wide
     */
    tiny?: number;

    /**
     * Under 768px wide
     */
    small?: number;

    /**
     * Under 992px wide
     */
    medium?: number;

    /**
     * Under 1200px wide
     */
    large?: number;

    /**
     * 1200px+ wide - always required as a fallback!
     */
    extraLarge: number;
  };
};

/**
 * All images need to be max width'd for our layouts
 */
const MaxWidthImage = styled(NextImage)({
  display: 'flex',
  maxWidth: '100%',
  height: 'auto',
  borderStyle: 'none',
});

/**
 * Turns the breakpoint to width map into a sizes string
 */
const generateSizesString = (sizes: ImageProps['sizes']): string => {
  const sizesString = Object.entries(sizes)
    .map(([breakpoint, width]) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const maxWidth = BREAKPOINT_MAX_SIZES[breakpoint as keyof typeof BREAKPOINT_MAX_SIZES];
      if (!maxWidth) {
        return `${width}px`;
      }
      return `(max-width: ${maxWidth}px) ${width}px`;
    })
    .join(', ');
  if (sizesString.length === 0) {
    throw new Error('No sizes provided for image');
  }
  return sizesString;
};

/**
 * Shows a Next Image with the contents of the Asset and custom
 * sizes as needed.
 */
export function Image({ url, title, alt, sizes, width, height, fill, ...props }: ImageProps) {
  if (!url) {
    return null;
  }
  const sharedProps = {
    alt: title ?? alt,
    src: url,
    sizes: generateSizesString(sizes),
    ...props,
  };

  if (!fill) {
    return <MaxWidthImage {...sharedProps} width={width} height={height} />;
  }
  return <NextImage {...sharedProps} fill />;
}
