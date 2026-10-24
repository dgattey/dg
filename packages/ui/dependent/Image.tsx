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

/**
 * All images need to be max width'd for our layouts. The declared ratio wins
 * over the file's own, so a 16:9 upload in a square album slot crops instead of
 * collapsing into a short strip.
 */
const createMaxWidthImageStyle = (width: number, height: number): CSSProperties => ({
  aspectRatio: `${width} / ${height}`,
  borderStyle: 'none',
  display: 'flex',
  height: 'auto',
  maxWidth: '100%',
  objectFit: 'cover',
});

const coverImageStyle: CSSProperties = {
  borderStyle: 'none',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
};

const fillCompactImageStyle: CSSProperties = {
  ...coverImageStyle,
  inset: 0,
  position: 'absolute',
};

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

  if (maxDisplayWidth <= COMPACT_DENSITY_MAX_WIDTH) {
    const targetWidth = Math.round(maxDisplayWidth);
    const targetHeight =
      width > 0 && height > 0
        ? Math.max(1, Math.round(height * (targetWidth / width)))
        : targetWidth;
    const compactStyle = fill
      ? fillCompactImageStyle
      : cover
        ? coverImageStyle
        : createMaxWidthImageStyle(width, height);
    return (
      <NextImage
        alt={title ?? alt}
        height={targetHeight}
        src={url}
        style={compactStyle}
        width={targetWidth}
        {...props}
      />
    );
  }

  const sharedProps = {
    alt: title ?? alt,
    sizes: generateSizesString(sizes),
    src: url,
    ...props,
  };

  if (fill) {
    return <NextImage {...sharedProps} fill={true} />;
  }

  const style = cover ? coverImageStyle : createMaxWidthImageStyle(width, height);
  return <NextImage {...sharedProps} height={height} style={style} width={width} />;
}
