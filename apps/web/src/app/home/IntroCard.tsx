import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';

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

const composedCardSx: SxObject = {
  background: 'color-mix(in srgb, var(--mui-palette-background-paper) 52%, transparent)',
  borderColor: 'color-mix(in srgb, var(--mui-palette-common-white) 48%, transparent)',
  boxShadow: `
    inset 0 1.5px 0 color-mix(in srgb, var(--mui-palette-common-white) 84%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--mui-palette-common-white) 28%, transparent),
    0 18px 40px color-mix(in srgb, var(--mui-palette-common-black) 12%, transparent)
  `,
  display: 'flex',
  minHeight: { sm: '22rem', xs: 'auto' },
  overflow: 'visible',
  padding: { sm: '2.05rem 1.55rem 1.45rem 1.9rem', xs: '1.5rem 1.25rem' },
  width: '100%',
};

const composedLayoutSx: SxObject = {
  alignItems: { sm: 'stretch', xs: 'center' },
  flexDirection: { sm: 'row', xs: 'column-reverse' },
  gap: { sm: 3.25, xs: 2 },
  height: '100%',
  width: '100%',
};

const composedCopySx: SxObject = {
  flex: '1 1 58%',
  justifyContent: 'space-between',
  minWidth: 0,
  py: { md: 0.25, xs: 0 },
};

const composedTextSx: SxObject = {
  '& h1, & .MuiTypography-h1': {
    color: 'text.primary',
    fontFamily: 'var(--font-display)',
    fontSize: {
      sm: 'clamp(2.8rem, 2rem + 3.2vw, 4.25rem)',
      xs: 'clamp(2.2rem, 10vw, 3rem)',
    },
    fontStretch: 'normal',
    fontVariant: 'normal',
    fontWeight: 600,
    hyphens: 'none',
    letterSpacing: '-0.03em',
    lineHeight: 1.05,
    marginBottom: 0.75,
    maxWidth: '6.8ch',
    overflow: 'visible',
    overflowWrap: 'normal',
    paddingTop: '0.08em',
    width: '6.8ch',
    wordBreak: 'normal',
  },
  '& p': {
    color: 'text.secondary',
    fontSize: '0.98rem',
    lineHeight: 1.5,
    marginBottom: 1.15,
    maxWidth: '36ch',
  },
  '& p:first-of-type': {
    color: 'text.primary',
    fontSize: '1.08rem',
    fontWeight: 500,
    marginBottom: 0.85,
  },
  gap: 0,
};

const composedPortraitWrapSx: SxObject = {
  alignSelf: { sm: 'center', xs: 'center' },
  aspectRatio: '4 / 5',
  borderRadius: '1.2rem',
  boxShadow: '0 14px 28px color-mix(in srgb, var(--mui-palette-common-black) 16%, transparent)',
  flex: { sm: '0 0 36%', xs: '0 0 auto' },
  maxHeight: { sm: '18rem', xs: 'none' },
  overflow: 'hidden',
  width: { sm: '36%', xs: '70%' },
};

const composedPortraitImgSx: SxObject = {
  display: 'block',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
};

const socialRowSx: SxObject = {
  columnGap: 1.25,
  flexDirection: 'row',
  marginTop: 1,
};

const socialLinkSx: SxObject = {
  alignItems: 'center',
  color: 'text.secondary',
  display: 'inline-flex',
  fontSize: '1.15rem',
  height: 36,
  justifyContent: 'center',
  minWidth: 36,
};

export type IntroCardVariant = 'split' | 'composed';

type IntroCardProps = {
  linkedInLink: RenderableLink | null;
  introBlock: IntroContent;
  /**
   * `split` is today's two-card homepage. `composed` is the greenhouse intro:
   * name, tagline, bio, portrait, and socials in one matte card.
   */
  variant?: IntroCardVariant;
  socialLinks?: ReadonlyArray<RenderableLink>;
};

function IntroPortrait({ introBlock }: { introBlock: IntroContent }) {
  const { width, height, sizes } = useCurrentImageSizes();
  const alt = introBlock.image.title ?? 'Introduction image';
  if (introBlock.image.url.startsWith('http')) {
    return (
      <Image
        alt={alt}
        cover={true}
        height={height}
        priority={true}
        sizes={sizes}
        url={introBlock.image.url}
        width={width}
      />
    );
  }
  return (
    <Box
      alt={alt}
      component="img"
      height={height}
      src={introBlock.image.url}
      sx={composedPortraitImgSx}
      width={width}
    />
  );
}

function ComposedIntroCard({
  introBlock,
  socialLinks,
}: {
  introBlock: IntroContent;
  socialLinks: ReadonlyArray<RenderableLink>;
}) {
  return (
    <ContentCard data-bento="intro" sx={composedCardSx}>
      <Stack sx={composedLayoutSx}>
        <Stack sx={composedCopySx}>
          <RichText {...introBlock.textBlock.content} sx={composedTextSx} />
          {socialLinks.length > 0 ? (
            <Stack sx={socialRowSx}>
              {socialLinks.map((link) => (
                <Link
                  aria-label={link.title}
                  color="secondary"
                  href={link.url}
                  icon={link.icon ?? undefined}
                  isExternal={link.url.startsWith('http')}
                  key={link.url}
                  layout="icon"
                  sx={socialLinkSx}
                  title={link.title}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
        <Box sx={composedPortraitWrapSx}>
          <IntroPortrait introBlock={introBlock} />
        </Box>
      </Stack>
    </ContentCard>
  );
}

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock. The width/height here is for image
 * resizing, and the actual width may be smaller.
 */
export function IntroCard({
  introBlock,
  linkedInLink,
  socialLinks = [],
  variant = 'split',
}: IntroCardProps) {
  const { width, height, sizes } = useCurrentImageSizes();

  if (variant === 'composed') {
    return <ComposedIntroCard introBlock={introBlock} socialLinks={socialLinks} />;
  }

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
        <RichText {...introBlock.textBlock.content} sx={introTextSx} />
      </ContentCard>
    </>
  );
}
