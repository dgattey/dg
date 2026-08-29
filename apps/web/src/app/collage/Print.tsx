import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import { Image, type ImageSizes } from '@dg/ui/dependent/Image';
import type { ImageProps as NextImageProps } from 'next/image';
import styles from './Print.module.css';

type PrintTreatment = 'portrait' | 'project';

type PrintProps = {
  alt: NextImageProps['alt'];
  className?: string;
  image: RenderableAsset;
  preload?: NextImageProps['preload'];
  quality: NonNullable<NextImageProps['quality']>;
  sizes: ImageSizes;
  treatment?: PrintTreatment;
};

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined).join(' ');
}

export function Print({
  alt,
  className,
  image,
  preload,
  quality,
  sizes,
  treatment = 'portrait',
}: PrintProps) {
  return (
    <span
      className={classNames(
        styles.print,
        treatment === 'project' ? styles.project : styles.portrait,
        className,
      )}
    >
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
