import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';

/**
 * Width of the intro image on small screens
 */
const SMALL_IMAGE_SIZE = '16em';

const overlaySx: SxObject = {
  visibility: { md: 'visible', xs: 'hidden' },
};

const introImageCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: SMALL_IMAGE_SIZE },
  maxWidth: { md: 'unset', xs: SMALL_IMAGE_SIZE },
  minWidth: { md: 'unset', xs: SMALL_IMAGE_SIZE },
};

const introTextCardSx: SxObject = {
  alignItems: 'center',
  background: 'none',
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

/**
 * The intro copy shares a row with fixed-height cards, so it has one grid cell
 * of vertical room. Two things keep it there: the stack owns the rhythm with a
 * single gap instead of per-element margins, and the paragraphs sit at the root
 * font size rather than the responsively scaled `body1`, which grows enough on
 * wide screens to push the last paragraph onto an extra line.
 */
const introTextSx: SxObject = {
  '& > .MuiTypography-root': {
    marginBottom: 0,
  },
  '& p': {
    fontSize: '1rem',
  },
  gap: 2.5,
};

type IntroCardProps = {
  linkedInLink: RenderableLink | null;
  introBlock: IntroContent;
};

/**
 * The portrait half of the intro, linked to LinkedIn. Split out from the copy so
 * the forest map can plant the two in separate clearings; the grid still shows
 * them as adjacent cells.
 */
export function IntroImageCard({ introBlock, linkedInLink }: IntroCardProps) {
  const { width, height, sizes } = useCurrentImageSizes();

  return (
    <ContentCard
      link={linkedInLink}
      overlay="About"
      overlaySx={overlaySx}
      sx={introImageCardSx}
      verticalSpan={1}
    >
      <Image
        alt={introBlock.image.title ?? 'Introduction image'}
        cover={true}
        height={height}
        priority={true}
        sizes={sizes}
        url={introBlock.image.url}
        width={width}
      />
    </ContentCard>
  );
}

/** The intro copy, on a deliberately surface-less card so it reads as page text. */
export function IntroTextCard({ introBlock }: Pick<IntroCardProps, 'introBlock'>) {
  return (
    <ContentCard sx={introTextCardSx}>
      <RichText {...introBlock.textBlock.content} sx={introTextSx} />
    </ContentCard>
  );
}

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock. The width/height here is for image
 * resizing, and the actual width may be smaller.
 */
export function IntroCard({ introBlock, linkedInLink }: IntroCardProps) {
  return (
    <>
      <IntroImageCard introBlock={introBlock} linkedInLink={linkedInLink} />
      <IntroTextCard introBlock={introBlock} />
    </>
  );
}
