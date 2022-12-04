import type { Asset } from 'api/types/generated/contentfulApi.generated';
import NextImage, { ImageProps } from 'next/image';

type Props = Pick<React.ComponentProps<'img'>, 'className'> &
  Partial<Asset> &
  Pick<Asset, 'url' | 'width' | 'height'> & {
    /**
     * Alt text, required, but defaults to title
     */
    alt: string;

    /**
     * The image fill layout, defaulting to responsive
     */
    fill?: ImageProps['fill'];

    /**
     * For the image that should be the LCP
     */
    priority?: boolean;
  };

/**
 * Shows a Next Image with the contents of the Asset. Layout defaults to responsive.
 */
const Image = ({ url, width, height, fill, title, alt, className, priority }: Props) =>
  url ? (
    <NextImage
      className={className}
      src={url}
      alt={title ?? alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
    />
  ) : null;

export default Image;
