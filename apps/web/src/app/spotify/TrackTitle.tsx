import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';

type ListingVariant = 'card' | 'compact' | 'nowPlaying';

type TrackTitleProps = {
  trackTitle: string;
  /** If provided, renders as a link to this URL. If omitted, renders as plain text. */
  url?: string;
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
};

/**
 * Greenhouse now-playing titles wrap to two lines and break mid-word if needed.
 * Flag-off `card` / `compact` stay single-line ellipsis.
 */
const nowPlayingClampSx: SxObject = {
  display: '-webkit-box',
  marginBottom: 1,
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
};

const nowPlayingWideSx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (max-width: 22.5rem)': {
    display: 'none',
  },
};

const nowPlayingNarrowSx: SxObject = {
  ...nowPlayingClampSx,
  '@container now-playing (max-width: 22.5rem)': {
    display: '-webkit-box',
  },
  display: 'none',
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
}: {
  trackTitle: string;
  url?: string;
  color?: string;
  textShadow?: string;
}) {
  const paint = colorShadowSx(color, textShadow);
  const wideSx = { ...nowPlayingWideSx, ...paint };
  const narrowSx = { ...nowPlayingNarrowSx, ...paint };

  if (!url) {
    return (
      <>
        <Typography sx={wideSx} variant="h3">
          {trackTitle}
        </Typography>
        <Typography sx={narrowSx} variant="h5">
          {trackTitle}
        </Typography>
      </>
    );
  }

  return (
    <>
      <Link href={url} isExternal={true} sx={wideSx} title={trackTitle} variant="h3">
        {trackTitle}
      </Link>
      <Link href={url} isExternal={true} sx={narrowSx} title={trackTitle} variant="h5">
        {trackTitle}
      </Link>
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
}: TrackTitleProps) {
  if (listingVariant === 'nowPlaying') {
    return (
      <NowPlayingTitle color={color} textShadow={textShadow} trackTitle={trackTitle} url={url} />
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
