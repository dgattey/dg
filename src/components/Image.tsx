import type { Asset } from 'api/types/generated/contentfulApi.generated';
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
  };

/**
 * Shows a Next Image with the contents of the Asset. Layout defaults to responsive.
 */
const Image = ({ url, width, height, layout = 'responsive', title, alt, className }: Props) => (
  <NextImage
    className={className}
    src={url}
    alt={alt ?? title}
    width={layout !== 'fill' ? width : undefined}
    height={layout !== 'fill' ? height : undefined}
    layout={layout}
  />
);

export default Image;
