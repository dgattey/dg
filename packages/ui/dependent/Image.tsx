import type { ImageProps as NextImageProps } from 'next/image';
import NextImage from 'next/image';
import type { CSSProperties } from 'react';

const BREAKPOINT_MAX_SIZES = {
  extraTiny: 340,
  large: 1200,
  medium: 992,
  small: 768,
  tiny: 576,
};

type ImageSizes = {
  extraTiny?: number;
  tiny?: number;
  small?: number;
  medium?: number;
  large?: number;
  extraLarge: number;
};

type ImageProps = {
  url: string;
  width: number;
  height: number;
  fill?: NextImageProps['fill'];
  cover?: boolean;
  alt: NextImageProps['alt'];
  className?: string;
  preload?: NextImageProps['preload'];
  fetchPriority?: NextImageProps['fetchPriority'];
  loading?: NextImageProps['loading'];
  quality?: NextImageProps['quality'];
  title?: string | null;
  sizes: ImageSizes;
};

const COMPACT_DENSITY_MAX_WIDTH = 300;
const RESIZABLE_IMAGE_URL =
  /^(?:https:\/\/images\.ctfassets\.net\/(?!.*\.svg(?:$|\?))|https:\/\/i\.scdn\.co\/image\/ab67616d0000(?:b273|1e02|4851)[0-9a-f]{24,32}(?:$|\?)|https:\/\/mosaic\.scdn\.co\/(?:640|300|60)\/[0-9a-f]+(?:$|\?)|\/(?!\/)(?!.*\.svg(?:$|\?)))/i;

export const generateSizesString = (sizes: ImageSizes): string => {
  const sizesString = Object.entries(sizes)
    .map(([breakpoint, width]) => ({
      maxWidth: BREAKPOINT_MAX_SIZES[breakpoint as keyof typeof BREAKPOINT_MAX_SIZES],
      width,
    }))
    .sort(
      (a, b) => (a.maxWidth ?? Number.POSITIVE_INFINITY) - (b.maxWidth ?? Number.POSITIVE_INFINITY),
    )
    .map(({ maxWidth, width }) =>
      maxWidth ? `(max-width: ${maxWidth}px) ${width}px` : `${width}px`,
    )
    .join(', ');
  if (sizesString.length === 0) {
    throw new Error('No sizes provided for image');
  }
  return sizesString;
};

export function Image({
  url,
  title,
  alt,
  sizes,
  width,
  height,
  fill,
  cover,
  ...props
}: ImageProps) {
  const sizeValues = Object.values(sizes).filter((v): v is number => typeof v === 'number');
  const maxDisplayWidth = Math.max(...sizeValues, sizes.extraLarge);
  const aspectStyle =
    !fill && !cover
      ? ({ '--img-aspect-ratio': `${width} / ${height}` } as CSSProperties)
      : undefined;
  const unoptimized = !RESIZABLE_IMAGE_URL.test(url);

  if (maxDisplayWidth <= COMPACT_DENSITY_MAX_WIDTH) {
    const targetWidth = Math.round(maxDisplayWidth);
    const targetHeight =
      width > 0 && height > 0
        ? Math.max(1, Math.round(height * (targetWidth / width)))
        : targetWidth;
    const compactMode = fill ? 'fill-compact' : cover ? 'cover' : 'aspect';
    return (
      <NextImage
        alt={title ?? alt}
        data-ui-image={compactMode}
        height={targetHeight}
        src={url}
        style={aspectStyle}
        unoptimized={unoptimized}
        width={targetWidth}
        {...props}
      />
    );
  }

  const sharedProps = {
    alt: title ?? alt,
    sizes: generateSizesString(sizes),
    src: url,
    unoptimized,
    ...props,
  };

  if (fill) {
    return <NextImage {...sharedProps} fill={true} />;
  }

  return (
    <NextImage
      {...sharedProps}
      data-ui-image={cover ? 'cover' : 'aspect'}
      height={height}
      style={aspectStyle}
      width={width}
    />
  );
}
