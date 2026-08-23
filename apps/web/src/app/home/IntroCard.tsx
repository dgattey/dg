import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';

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
  backdropFilter: 'var(--card-backdrop-filter)',
  background: 'var(--card-bg)',
  borderColor: 'color-mix(in srgb, var(--mui-palette-common-white) 48%, transparent)',
  boxShadow: 'var(--card-box-shadow)',
  display: 'flex',
  minHeight: 'auto',
  overflow: 'visible',
  padding: { sm: '1.45rem 1.35rem 1.15rem 1.5rem', xs: '1.2rem 1.1rem' },
  width: '100%',
};

const composedLayoutSx: SxObject = {
  '&::after': {
    clear: 'both',
    content: '""',
    display: 'table',
  },
  alignItems: { xs: 'center' },
  display: { sm: 'block', xs: 'flex' },
  flexDirection: { xs: 'column' },
  gap: { xs: 2 },
  width: '100%',
};

const composedTextSx: SxObject = {
  '& h1, & .MuiTypography-h1': {
    color: 'text.primary',
    hyphens: 'none',
    marginBottom: 0.5,
    overflow: 'visible',
    overflowWrap: 'normal',
    paddingTop: '0.04em',
    wordBreak: 'normal',
  },
  '& p': {
    marginBottom: 0.55,
    maxWidth: '40ch',
  },
  '& p:first-of-type': {
    color: 'text.primary',
    marginBottom: 0.5,
  },
  '& p:last-of-type': {
    marginBottom: 0,
  },
  display: 'contents',
};

const composedPortraitWrapSx: SxObject = {
  aspectRatio: '4 / 5',
  borderRadius: '1.2rem',
  boxShadow: '0 14px 28px color-mix(in srgb, var(--mui-palette-common-black) 16%, transparent)',
  float: { sm: 'right', xs: 'none' },
  marginBottom: { sm: 1, xs: 0 },
  marginInlineStart: { sm: 2, xs: 0 },
  maxHeight: { sm: '20rem', xs: 'none' },
  maxWidth: { sm: '40%', xs: '70%' },
  overflow: 'hidden',
  width: { sm: '40%', xs: '70%' },
};

const composedPortraitImgSx: SxObject = {
  display: 'block',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  width: '100%',
};

const composedAboutOverlaySx: SxObject = {
  backdropFilter: 'blur(10px)',
  background: 'color-mix(in srgb, var(--mui-palette-background-default) 60%, transparent)',
  borderRadius: '0.65rem',
  bottom: '0.75rem',
  left: '0.75rem',
  padding: '0.35rem 0.7rem',
  position: 'absolute',
  transition: 'transform 0.2s ease',
  visibility: { md: 'visible', xs: 'hidden' },
  zIndex: 1,
};

const composedPortraitLinkSx: SxObject = {
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: 2,
  },
  '&:hover': {
    textDecoration: 'none',
  },
  '&:hover [data-role="intro-about-overlay"], &:focus-visible [data-role="intro-about-overlay"]': {
    transform: 'translate(-8px, 8px)',
  },
  ...composedPortraitWrapSx,
  display: 'block',
  position: 'relative',
  textDecoration: 'none',
};

const socialRowSx: SxObject = {
  columnGap: 1.25,
  flexDirection: 'row',
  marginTop: { sm: 0.35, xs: 1 },
};

const socialLinkSx: SxObject = {
  alignItems: 'center',
  color: 'text.secondary',
  display: 'inline-flex',
  height: 36,
  justifyContent: 'center',
  minWidth: 36,
  width: 36,
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

function ComposedPortrait({
  introBlock,
  linkedInLink,
}: {
  introBlock: IntroContent;
  linkedInLink: RenderableLink | null;
}) {
  const portrait = (
    <>
      <IntroPortrait introBlock={introBlock} />
      {linkedInLink ? (
        <Box data-role="intro-about-overlay" sx={composedAboutOverlaySx}>
          <Typography variant="overline">About</Typography>
        </Box>
      ) : null}
    </>
  );

  if (!linkedInLink) {
    return <Box sx={composedPortraitWrapSx}>{portrait}</Box>;
  }

  return (
    <Link
      aria-label="About"
      href={linkedInLink.url}
      isExternal={linkedInLink.url.startsWith('http')}
      sx={composedPortraitLinkSx}
      title="About"
    >
      {portrait}
    </Link>
  );
}

function ComposedIntroCard({
  introBlock,
  linkedInLink,
  socialLinks,
}: {
  introBlock: IntroContent;
  linkedInLink: RenderableLink | null;
  socialLinks: ReadonlyArray<RenderableLink>;
}) {
  return (
    <ContentCard data-bento="intro" sx={composedCardSx}>
      <Box sx={composedLayoutSx}>
        <ComposedPortrait introBlock={introBlock} linkedInLink={linkedInLink} />
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
      </Box>
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
    return (
      <ComposedIntroCard
        introBlock={introBlock}
        linkedInLink={linkedInLink}
        socialLinks={socialLinks}
      />
    );
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
