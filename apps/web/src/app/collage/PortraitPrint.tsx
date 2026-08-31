import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { Image } from '@dg/ui/dependent/Image';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';
import styles from './print.module.css';

export function introImageAlt(image: Pick<RenderableAsset, 'title'>): string {
  return image.title ?? 'Introduction image';
}

export function PortraitPrint({
  className,
  image,
  linkedInLink,
}: {
  className?: string;
  image: RenderableAsset;
  linkedInLink: RenderableLink | null;
}) {
  const rootClassName = cx(styles.portrait, 'collageLift', className);
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
          <span className={cx(styles.print, styles.treatmentPortrait, styles.image)}>
            <Image
              alt={introImageAlt(image)}
              cover={true}
              height={image.height}
              preload={true}
              quality={65}
              sizes={{ extraLarge: 392, large: 392, medium: 300, small: 300, tiny: 300 }}
              url={image.url}
              width={image.width}
            />
          </span>
        </span>
      </span>
      <PaperTag className={`collagePin ${styles.tag}`} edge="quad-c" tiltDeg={-5} tone="ochre">
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
