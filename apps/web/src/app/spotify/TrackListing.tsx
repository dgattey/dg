import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import { Stack } from '@dg/ui/core/Stack';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCE, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import { ArtistList } from './ArtistList';
import { COLLAGE_TRACK_COLORS, CollageTrackCard } from './CollageTrackCard';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';

const COMPACT_THUMBNAIL_SIZE = 44;

type TrackListingProps = {
  track: Track;
  variant?: 'card' | 'compact';
  disableLinks?: boolean;
};

const COMPACT_HOVER_SIZE = 84;
const COLLAGE_COMPACT_BOUNCE = 3;
const COMPACT_HOVER_SCALE = COMPACT_HOVER_SIZE / COMPACT_THUMBNAIL_SIZE;

const compactZoomSx: SxObject = {
  '[data-album-art]': {
    boxShadow: 'var(--mui-extraShadows-card-hovered)',
    transform: `scale(${COMPACT_HOVER_SCALE})`,
    zIndex: 1,
  },
  '[data-thumbnail-outer]': {
    width: COMPACT_HOVER_SIZE,
  },
};

const compactContainerSx: SxObject = {
  '@media (hover: hover)': {
    '&:hover': compactZoomSx,
  },
  '*:focus-visible &, &:has(:focus-visible)': compactZoomSx,
  alignItems: 'center',
  display: 'flex',
  gap: 1,
  minWidth: 0,
  overflow: 'visible',
};

const compactThumbnailOuterSx: SxObject = {
  flexShrink: 0,
  height: COMPACT_THUMBNAIL_SIZE,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  transition: createTransition('width', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
};

const compactAlbumCardSx: SxObject = {
  borderRadius: 'var(--nested-radius)',
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
  color: COLLAGE_TRACK_COLORS.primary,
  minWidth: 0,
  width: '100%',
};

function CompactLayout({ track, disableLinks }: { track: Track; disableLinks?: boolean }) {
  const isPlaying = track.isPlaying ?? false;
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const albumImageUrl = track.albumImage.url;
  const trackUrl = track.externalUrls.spotify;

  const albumArtCard = (
    <Box data-album-art sx={compactAlbumCardSx}>
      <Image
        alt={albumTitle}
        fill={true}
        height={COMPACT_THUMBNAIL_SIZE}
        sizes={{ extraLarge: COMPACT_THUMBNAIL_SIZE }}
        url={albumImageUrl}
        width={COMPACT_THUMBNAIL_SIZE}
      />
    </Box>
  );

  return (
    <Box sx={compactContainerSx}>
      <Box data-thumbnail-outer sx={compactThumbnailOuterSx}>
        <AlbumArtWithNotes
          bounceIntensity={COLLAGE_COMPACT_BOUNCE}
          isPlaying={isPlaying}
          noteColor="var(--ink)"
          notesVariant="collageCompact"
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
            color={COLLAGE_TRACK_COLORS.primary}
            isPlaying={track.isPlaying}
            listingVariant="compact"
            playedAt={track.playedAt}
          />
          <TrackTitle
            color={COLLAGE_TRACK_COLORS.primary}
            listingVariant="compact"
            trackTitle={track.name}
            url={disableLinks ? undefined : trackUrl}
          />
          <ArtistList
            artists={track.artists}
            color={COLLAGE_TRACK_COLORS.secondary}
            listingVariant="compact"
          />
        </Stack>
      </Box>
    </Box>
  );
}

export function TrackListing({ track, variant = 'card', disableLinks }: TrackListingProps) {
  if (variant === 'compact') {
    return <CompactLayout disableLinks={disableLinks} track={track} />;
  }

  return <CollageTrackCard track={track} />;
}
