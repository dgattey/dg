import type { RenderableAsset } from '@dg/content-models/contentful/renderables/assets';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

/** Frame widths above and below the 820px layout switch, and the window's width to height. */
const PORTRAIT_WIDTH = 392;
const PORTRAIT_WIDTH_NARROW = 300;
const PORTRAIT_WINDOW_ASPECT = 0.76;

const portraitVars = {
  '--portrait-aspect': PORTRAIT_WINDOW_ASPECT,
  '--portrait-width': `${PORTRAIT_WIDTH}px`,
  '--portrait-width-narrow': `${PORTRAIT_WIDTH_NARROW}px`,
} as CSSProperties;

function introImageAlt(image: Pick<RenderableAsset, 'title'>): string {
  return image.title ?? 'Introduction image';
}

/**
 * How wide the photo renders when it covers a frame this wide. The window is
 * taller than it is wide, so a squarer photo scales to the window's height and
 * overflows sideways. Requesting only the frame width fetches too few pixels.
 */
function coverWidth(frameWidth: number, image: Pick<RenderableAsset, 'width' | 'height'>) {
  const imageAspect = image.width / image.height;
  return Math.ceil(Math.max(frameWidth, (frameWidth / PORTRAIT_WINDOW_ASPECT) * imageAspect));
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
  const wide = coverWidth(PORTRAIT_WIDTH, image);
  const narrow = coverWidth(PORTRAIT_WIDTH_NARROW, image);
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
              quality={75}
              sizes={{ extraLarge: wide, large: wide, medium: wide, small: narrow, tiny: narrow }}
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
    <div className={cx('print__portrait', className)} style={portraitVars}>
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
