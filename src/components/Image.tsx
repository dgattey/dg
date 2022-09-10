import type { Asset } from '@dg/api/types/generated/contentfulApi.generated';
import NextImage, { ImageProps } from 'next/image';

type Props = Pick<React.ComponentProps<'img'>, 'className'> &
  Partial<Asset> &
  Pick<Asset, 'url' | 'width' | 'height'> & {
    /**
     * Alt text, required, but defaults to title
     */
    alt?: string;

    /**
     * The image layout, defaulting to responsive
     */
    layout?: ImageProps['layout'];

    /**
     * For the image that should be the LCP
     */
    priority?: boolean;
  };

/**
 * Shows a Next Image with the contents of the Asset. Layout defaults to responsive.
 */
const Image = ({
  url,
  width,
  height,
  layout = 'intrinsic',
  title,
  alt,
  className,
  priority,
}: Props) =>
  url ? (
    <NextImage
      className={className}
      src={url}
      alt={alt ?? title}
      width={width}
      height={height}
      layout={layout}
      priority={priority}
    />
  ) : null;

export default Image;
