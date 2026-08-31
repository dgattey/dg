import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { CutLetters } from '../collage/CutLetters';
import collageStyles from '../collage/home.module.css';
import { PaperCard } from '../collage/PaperCard';
import { introImageAlt, PortraitPrint } from '../collage/PortraitPrint';
import { splitIntroDocument } from '../collage/splitIntroDocument';

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
  surface?: SiteSurface;
};

function ClassicIntroCard({ introBlock, linkedInLink }: IntroCardProps) {
  const { width, height, sizes } = useCurrentImageSizes();

  return (
    <>
      <ContentCard
        link={linkedInLink}
        overlay="About"
        overlaySx={overlaySx}
        sx={introImageCardSx}
        verticalSpan={1}
      >
        <Image
          alt={introImageAlt(introBlock.image)}
          cover={true}
          height={height}
          preload={true}
          sizes={sizes}
          url={introBlock.image.url}
          width={width}
        />
      </ContentCard>
      <ContentCard sx={introTextCardSx}>
        <RichText {...introBlock.textBlock.content} sx={introTextSx} />
      </ContentCard>
    </>
  );
}

export function IntroCard({ introBlock, linkedInLink, surface = 'classic' }: IntroCardProps) {
  if (surface === 'collage') {
    const { headline, remainder } = splitIntroDocument(introBlock.textBlock.content);

    return (
      <>
        <PortraitPrint
          className={collageStyles.portraitSlot}
          image={introBlock.image}
          linkedInLink={linkedInLink}
        />
        {headline ? <CutLetters className={collageStyles.headline} text={headline} /> : null}
        <PaperCard
          className={collageStyles.intro}
          edge="quad-a"
          innerClassName={collageStyles.introInner}
          tiltDeg={-1}
          tone="cream"
        >
          <RichText {...remainder} />
        </PaperCard>
      </>
    );
  }

  return <ClassicIntroCard introBlock={introBlock} linkedInLink={linkedInLink} />;
}
