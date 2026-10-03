import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import { Image, type ImageSizes } from '@dg/ui/dependent/Image';
import type { ImageProps as NextImageProps } from 'next/image';
import styles from './Print.module.css';

type PrintProps = {
  alt: NextImageProps['alt'];
  className?: string;
  image: RenderableAsset;
  preload?: NextImageProps['preload'];
  quality: NonNullable<NextImageProps['quality']>;
  sizes: ImageSizes;
};

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined).join(' ');
}

export function Print({ alt, className, image, preload, quality, sizes }: PrintProps) {
  return (
    <span className={classNames(styles.print, className)}>
      <Image
        alt={alt}
        cover={true}
        height={image.height}
        preload={preload}
        quality={quality}
        sizes={sizes}
        url={image.url}
        width={image.width}
      />
    </span>
  );
}
