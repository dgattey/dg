import type { Track } from '@dg/content-models/spotify/Track';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCE, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Card, Stack } from '@mui/material';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import { AlbumImage } from './AlbumImage';
import { ArtistList } from './ArtistList';
import { type Colors, getContrastingColors } from './colors';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { SpotifyLogo } from './SpotifyLogo';
import { TrackTitle } from './TrackTitle';

/** Size of the compact variant's album art thumbnail in px. */
export const COMPACT_THUMBNAIL_SIZE = 44;

type TrackListingProps = {
  /** The track to display. */
  track: Track;

  /**
   * Layout variant:
   * - `card` (default): Full card with logo, large album art, status, title, artists, progress bar
   * - `compact`: Small album art with truncated status/title/artists for tight spaces
   * - `thumbnail`: Album art only, with a tooltip showing track and artist info
   */
  variant?: 'card' | 'compact' | 'thumbnail';

  /** Disable external links (e.g. compact variant on the home page). */
  disableLinks?: boolean;

  /** Control animation independently of playback state (e.g. pause when off-screen). Defaults to true. */
  shouldAnimate?: boolean;
};

// ---------------------------------------------------------------------------
// Card variant
// ---------------------------------------------------------------------------

const cardLayoutSx: SxObject = {
  flex: 1,
  gap: 1,
  justifyContent: 'space-between',
};

const cardHeaderSx: SxObject = {
  gap: 6,
  justifyContent: 'space-between',
};

function CardLayout({ track, colors }: { track: Track; colors: Colors | null }) {
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};
  const trackUrl = track.externalUrls.spotify;

  return (
    <Stack sx={cardLayoutSx}>
      <Stack direction="row" sx={cardHeaderSx}>
        <SpotifyLogo
          color={primary}
          textShadow={primaryShadow}
          trackTitle={track.name}
          url={trackUrl}
        />
        <AlbumImage isPlaying={Boolean(track.isPlaying)} noteColor={primary} track={track} />
      </Stack>
      <Stack>
        <PlaybackStatus
          color={primary}
          isPlaying={track.isPlaying}
          listingVariant="card"
          playedAt={track.playedAt}
          textShadow={primaryShadow}
        />
        <TrackTitle
          color={primary}
          listingVariant="card"
          textShadow={primaryShadow}
          trackTitle={track.name}
          url={trackUrl}
        />
        <ArtistList
          artists={track.artists}
          color={secondary}
          listingVariant="card"
          textShadow={secondaryShadow}
        />
        <PlaybackProgressBar
          colors={colors}
          durationMs={track.durationMs}
          isPlaying={track.isPlaying}
          progressMs={track.progressMs}
        />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Compact variant
// ---------------------------------------------------------------------------

const COMPACT_HOVER_SIZE = 84;
const COMPACT_HOVER_SCALE = COMPACT_HOVER_SIZE / COMPACT_THUMBNAIL_SIZE;

const compactContainerSx: SxObject = {
  /** Scale album art on hover — only on devices with true hover capability. */
  '@media (hover: hover)': {
    '&:hover': {
      '[data-album-art]': {
        boxShadow: 'var(--mui-extraShadows-card-hovered)',
        transform: `scale(${COMPACT_HOVER_SCALE})`,
        zIndex: 1,
      },
      '[data-thumbnail-outer]': {
        width: COMPACT_HOVER_SIZE,
      },
    },
  },
  alignItems: 'center',
  display: 'flex',
  gap: 1,
  minWidth: 0,
  overflow: 'visible',
};

/** Outer wrapper — width transitions on parent hover via [data-thumbnail-outer]. */
const compactThumbnailOuterSx: SxObject = {
  flexShrink: 0,
  height: COMPACT_THUMBNAIL_SIZE,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  transition: createTransition('width', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
};

/** Album art card — transform transitions on parent hover via [data-album-art]. */
const compactAlbumCardSx: SxObject = {
  borderRadius: 1,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  height: COMPACT_THUMBNAIL_SIZE,
  overflow: 'hidden',
  position: 'relative',
  transformOrigin: 'left center',
  transition: createTransition('transform', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
  willChange: 'transform',
};

const compactTextWrapperSx: SxObject = {
  flexShrink: 1,
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  width: 'fit-content',
};

const compactTextStackSx: SxObject = {
  color: 'var(--mui-palette-text-primary)',
  minWidth: 0,
  width: '100%',
};

function CompactLayout({
  track,
  disableLinks,
  shouldAnimate,
}: {
  track: Track;
  disableLinks?: boolean;
  shouldAnimate: boolean;
}) {
  const isPlaying = track.isPlaying ?? false;
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const albumImageUrl = track.albumImage.url;
  const trackUrl = track.externalUrls.spotify;

  const albumArtCard = (
    <Card data-album-art sx={compactAlbumCardSx}>
      <Image
        alt={albumTitle}
        fill={true}
        height={COMPACT_THUMBNAIL_SIZE}
        sizes={{ extraLarge: COMPACT_THUMBNAIL_SIZE }}
        url={albumImageUrl}
        width={COMPACT_THUMBNAIL_SIZE}
      />
    </Card>
  );

  return (
    <Box sx={compactContainerSx}>
      <Box data-thumbnail-outer sx={compactThumbnailOuterSx}>
        <AlbumArtWithNotes
          isPlaying={isPlaying}
          notesVariant="compact"
          shouldAnimate={shouldAnimate}
          wrapperSx={{
            height: COMPACT_THUMBNAIL_SIZE,
            width: COMPACT_THUMBNAIL_SIZE,
          }}
        >
          {disableLinks ? (
            <Box component="span" sx={{ display: 'block' }}>
              {albumArtCard}
            </Box>
          ) : (
            <Link href={albumUrl} isExternal={true} title={albumTitle}>
              {albumArtCard}
            </Link>
          )}
        </AlbumArtWithNotes>
      </Box>
      <Box sx={compactTextWrapperSx}>
        <Stack sx={compactTextStackSx}>
          <PlaybackStatus
            animating={shouldAnimate && isPlaying}
            isPlaying={track.isPlaying}
            listingVariant="compact"
            playedAt={track.playedAt}
          />
          <TrackTitle
            listingVariant="compact"
            trackTitle={track.name}
            url={disableLinks ? undefined : trackUrl}
          />
          <ArtistList artists={track.artists} listingVariant="compact" />
        </Stack>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Thumbnail variant
// ---------------------------------------------------------------------------

function ThumbnailLayout({ track }: { track: Track }) {
  const artistNames = track.artists.map((a) => a.name).join(', ');
  const tooltip = `${track.name} – ${artistNames}`;

  return (
    <Tooltip title={tooltip}>
      <AlbumImage isPlaying={false} track={track} />
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Unified track display component. Colors are computed once from the track's
 * gradient and passed to all sub-components, avoiding redundant calculations.
 *
 * Variants:
 * - `card` — full now-playing card with logo, large art, progress bar
 * - `compact` — inline header thumbnail with small art + truncated text
 * - `thumbnail` — album art with hover tooltip for grid displays
 */
export function TrackListing({
  track,
  variant = 'card',
  disableLinks,
  shouldAnimate = true,
}: TrackListingProps) {
  const colors = getContrastingColors(track);

  switch (variant) {
    case 'card':
      return <CardLayout colors={colors} track={track} />;
    case 'compact':
      return (
        <CompactLayout disableLinks={disableLinks} shouldAnimate={shouldAnimate} track={track} />
      );
    case 'thumbnail':
      return <ThumbnailLayout track={track} />;
  }
}
