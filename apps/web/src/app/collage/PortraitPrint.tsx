import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import type { ImageSizes } from '@dg/ui/dependent/Image';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { PaperTag } from './PaperTag';
import styles from './PortraitPrint.module.css';
import { Print } from './Print';

const PORTRAIT_SIZES: ImageSizes = {
  extraLarge: 392,
  large: 392,
  medium: 300,
  small: 300,
  tiny: 300,
};

type PortraitPrintProps = {
  className?: string;
  image: RenderableAsset;
  linkedInLink: RenderableLink | null;
};

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined).join(' ');
}

export function PortraitPrint({ className, image, linkedInLink }: PortraitPrintProps) {
  const rootClassName = classNames(styles.portrait, className);
  const contents = (
    <>
      {CUT_OUT_PLACEMENTS.portrait.map((placement) => (
        <CutOut
          className={placement.id === 'portrait-monstera' ? styles.backdrop : undefined}
          key={placement.id}
          placement={placement}
        />
      ))}
      <span className={styles.frame}>
        <span aria-hidden="true" className={styles.halo} />
        <span className={styles.window}>
          <Print
            alt={image.title ?? 'Introduction image'}
            className={styles.image}
            image={image}
            preload={true}
            quality={65}
            sizes={PORTRAIT_SIZES}
          />
        </span>
      </span>
      <PaperTag className={styles.tag} edge="quad-c" tiltDeg={-5} tone="ochre">
        <span>About</span>
        <small>{linkedInLink?.title ?? 'LinkedIn'}</small>
      </PaperTag>
    </>
  );

  if (!linkedInLink) {
    return <div className={rootClassName}>{contents}</div>;
  }

  return (
    <a
      aria-label={`About on ${linkedInLink.title}`}
      className={rootClassName}
      href={linkedInLink.url}
      rel="noreferrer"
      target="_blank"
    >
      {contents}
    </a>
  );
}
