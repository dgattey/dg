import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';

type ListingVariant = 'card' | 'compact' | 'nowPlaying';

export type NowPlayingLayout = 'cell' | 'hero';

type TrackTitleProps = {
  trackTitle: string;
  /** If provided, renders as a link to this URL. If omitted, renders as plain text. */
  url?: string;
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
  /** Greenhouse now-playing only. `hero` adds `h2` above 30rem. */
  layout?: NowPlayingLayout;
};

/**
 * Greenhouse now-playing titles wrap to two lines at word boundaries.
 * Flag-off `card` / `compact` stay single-line ellipsis.
 */
const nowPlayingClampSx: SxObject = {
  display: '-webkit-box',
  marginBottom: 1,
  overflow: 'hidden',
  overflowWrap: 'break-word',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  wordBreak: 'normal',
};

const nowPlayingH3Sx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (max-width: 22.5rem)': {
    display: 'none',
  },
};

const nowPlayingH4Sx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (min-width: 12rem) and (max-width: 22.5rem)': {
    display: '-webkit-box',
  },
  display: 'none',
};

const nowPlayingH5Sx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (max-width: 12rem)': {
    display: '-webkit-box',
  },
  display: 'none',
};

const nowPlayingHeroH2Sx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (min-width: 30rem)': {
    display: '-webkit-box',
  },
  display: 'none',
};

const hideWhenHeroWide: SxObject = {
  '@container now-playing (min-width: 30rem)': {
    display: 'none',
  },
};

const VARIANT_SX: Record<ListingVariant, SxObject> = {
  card: {
    ...truncated(1),
    marginBottom: 1,
  },
  compact: {
    ...truncated(1),
    lineHeight: 1.2,
  },
  nowPlaying: nowPlayingClampSx,
};

const TYPOGRAPHY_VARIANT: Record<ListingVariant, 'h5' | 'caption'> = {
  card: 'h5',
  compact: 'caption',
  nowPlaying: 'h5',
};

function colorShadowSx(color?: string, textShadow?: string): SxObject {
  return {
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
  };
}

function getTrackTitleSx(
  listingVariant: ListingVariant,
  color?: string,
  textShadow?: string,
): SxObject {
  return {
    ...VARIANT_SX[listingVariant],
    ...colorShadowSx(color, textShadow),
  };
}

function NowPlayingTitle({
  trackTitle,
  url,
  color,
  textShadow,
  layout,
}: {
  trackTitle: string;
  url?: string;
  color?: string;
  textShadow?: string;
  layout: NowPlayingLayout;
}) {
  const paint = colorShadowSx(color, textShadow);
  const cellSteps = [
    { sx: { ...nowPlayingH3Sx, ...paint }, variant: 'h3' as const },
    { sx: { ...nowPlayingH4Sx, ...paint }, variant: 'h4' as const },
    { sx: { ...nowPlayingH5Sx, ...paint }, variant: 'h5' as const },
  ];
  const steps =
    layout === 'hero'
      ? [
          { sx: { ...nowPlayingHeroH2Sx, ...paint }, variant: 'h2' as const },
          ...cellSteps.map(({ sx, variant }) => ({
            sx: { ...sx, ...hideWhenHeroWide },
            variant,
          })),
        ]
      : cellSteps;

  if (!url) {
    return (
      <>
        {steps.map(({ sx, variant }) => (
          <Typography key={variant} sx={sx} variant={variant}>
            {trackTitle}
          </Typography>
        ))}
      </>
    );
  }

  return (
    <>
      {steps.map(({ sx, variant }) => (
        <Link
          href={url}
          isExternal={true}
          key={variant}
          sx={sx}
          title={trackTitle}
          variant={variant}
        >
          {trackTitle}
        </Link>
      ))}
    </>
  );
}

/**
 * Shows a track title, optionally linked to the song on Spotify.
 * Styling is driven by the parent TrackListing's variant.
 */
export function TrackTitle({
  trackTitle,
  url,
  color,
  textShadow,
  listingVariant = 'card',
  layout = 'cell',
}: TrackTitleProps) {
  if (listingVariant === 'nowPlaying') {
    return (
      <NowPlayingTitle
        color={color}
        layout={layout}
        textShadow={textShadow}
        trackTitle={trackTitle}
        url={url}
      />
    );
  }

  const sx = getTrackTitleSx(listingVariant, color, textShadow);
  const typographyVariant = TYPOGRAPHY_VARIANT[listingVariant];

  if (!url) {
    return (
      <Typography sx={sx} variant={typographyVariant}>
        {trackTitle}
      </Typography>
    );
  }

  return (
    <Link href={url} isExternal={true} sx={sx} title={trackTitle} variant={typographyVariant}>
      {trackTitle}
    </Link>
  );
}
