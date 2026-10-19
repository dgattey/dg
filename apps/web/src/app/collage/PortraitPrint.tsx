import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { Image } from '@dg/ui/dependent/Image';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

function introImageAlt(image: Pick<RenderableAsset, 'title'>): string {
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
  const frameAndTag = (
    <>
      <span className="print__frame">
        <span aria-hidden="true" className="print__halo" />
        <span className="print__window">
          <span className={cx('print__print', 'print__image')}>
            <Image
              alt={introImageAlt(image)}
              cover={true}
              fetchPriority="high"
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
      <PaperTag className="collagePin print__tag" edge="quad-c" tiltDeg={-5} tone="ochre">
        <span>About</span>
        <small>Dylan</small>
      </PaperTag>
    </>
  );

  return (
    <div className={cx('print__portrait', className)}>
      {CUT_OUT_PLACEMENTS.portrait.map((placement) => (
        <CutOut
          className={placement.id === 'portrait-monstera' ? 'print__backdrop' : undefined}
          key={placement.id}
          placement={placement}
        />
      ))}
      {linkedInLink ? (
        <a
          aria-label={`About on ${linkedInLink.title}`}
          className="print__portraitLink collageLift"
          href={linkedInLink.url}
          rel="noreferrer"
          target="_blank"
        >
          {frameAndTag}
        </a>
      ) : (
        <div className="print__portraitLink">{frameAndTag}</div>
      )}
    </div>
  );
}
