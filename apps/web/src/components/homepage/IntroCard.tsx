import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { RichText } from '../RichText';

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
};

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock. The width/height here is for image
 * resizing, and the actual width may be smaller.
 */
type IntroCardProps = {
  linkedInLink: RenderableLink | null;
  introBlock: IntroContent;
};

export function IntroCard({ introBlock, linkedInLink }: IntroCardProps) {
  const { width, height, sizes } = useCurrentImageSizes();

  return (
    <>
      <ContentCard link={linkedInLink} overlay="About" overlaySx={overlaySx} sx={introImageCardSx}>
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
      <ContentCard sx={introTextCardSx}>
        <RichText {...introBlock.textBlock.content} />
      </ContentCard>
    </>
  );
}
