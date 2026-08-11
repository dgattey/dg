'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { EASING_DEFAULT } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import { AlbumGradientBackdrop, GRADIENT_CROSSFADE_MS } from './AlbumGradientBackdrop';
import { type AlbumGradientInformation, extractAlbumGradientFromUrl } from './extractAlbumGradient';
import { SpotifyCardScrollTracker } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

/**
 * Longest the outgoing track stays up while the next album's colors extract.
 * Covers a cold image fetch without stranding stale playback info on screen.
 */
const COLOR_HANDOFF_TIMEOUT_MS = 1500;

/** Art and text land at this opacity and settle up as the color dissolves. */
const CONTENT_SETTLE_START_OPACITY = 0.4;

type SpotifyCardShellProps = {
  children: ReactNode;
  contentRef: RefObject<HTMLDivElement | null>;
  gradient?: string;
};

// The shell sits inside the scroll-tracker grid item, so it has to pass the
// cell height down or the card sizes to its contents and sits short of neighbors.
const shellContainerSx: SxObject = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
};

const gradientGlowSx: SxObject = {
  borderRadius: 6,
  filter: 'blur(16px)',
  inset: -2,
  opacity: 0.5,
  zIndex: 0,
};

/**
 * Sits behind the card's contents but above its paper background, inset by the
 * hairline border so the gradient still reaches the card's edges.
 */
const gradientSurfaceSx: SxObject = {
  borderRadius: 'inherit',
  inset: '-1px',
  zIndex: -1,
};

const cardSx: SxObject = {
  display: 'flex',
  height: '100%',
  minWidth: { md: 'auto', xs: 'min(max-content, inherit)' },
  overflow: 'visible',
  padding: 2.5,
  position: 'relative',
  zIndex: 1,
};

/** Transparent to layout — exists only so the content can be animated as a unit. */
const cardContentSx: SxObject = {
  display: 'flex',
  flex: 1,
  minWidth: 0,
};

function SpotifyCardShell({ children, contentRef, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      <AlbumGradientBackdrop containerSx={gradientGlowSx} gradient={gradient} />
      <ContentCard sx={cardSx}>
        <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
        <Box ref={contentRef} sx={cardContentSx}>
          {children}
        </Box>
      </ContentCard>
    </Box>
  );
}

/**
 * Settles art and text in alongside the color instead of cutting them. Animated
 * imperatively so the album art element survives the swap — remounting it to
 * key an animation would blank the cover while the new file decodes. Honors
 * reduced motion by leaving the swap instant.
 */
function useContentSettle(trackId: string) {
  const contentRef = useRef<HTMLDivElement>(null);
  const settledTrackId = useRef(trackId);

  useEffect(() => {
    if (settledTrackId.current === trackId) {
      return;
    }
    settledTrackId.current = trackId;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    contentRef.current?.animate([{ opacity: CONTENT_SETTLE_START_OPACITY }, { opacity: 1 }], {
      duration: GRADIENT_CROSSFADE_MS,
      easing: EASING_DEFAULT,
    });
  }, [trackId]);

  return contentRef;
}

type SpotifyCardWithGradientProps = {
  track: Track;
};

/**
 * Client card that derives album-art gradient/contrast in the browser.
 * Keeps sharp (and its native libvips) out of the homepage server module graph.
 */
export function SpotifyCardWithGradient({ track }: SpotifyCardWithGradientProps) {
  const [displayTrack, setDisplayTrack] = useState(track);
  const contentRef = useContentSettle(displayTrack.id);

  useEffect(() => {
    let cancelled = false;
    // Keep the outgoing track up until the next album's colors are ready, then
    // swap art, text, and gradient together. Showing the new track the moment
    // it arrives paints a gradient-less card until extraction finishes, which
    // is the flash. The gradient itself dissolves in AlbumGradientBackdrop.
    const showTrack = (info?: AlbumGradientInformation) => {
      if (cancelled) {
        return;
      }
      setDisplayTrack({
        ...track,
        albumGradient: info?.backgroundGradient ?? undefined,
        albumGradientContrastSetting: info?.contrastSetting ?? undefined,
      });
    };
    const timeoutId = window.setTimeout(showTrack, COLOR_HANDOFF_TIMEOUT_MS);
    extractAlbumGradientFromUrl(track.albumImage.url).then((info) => {
      window.clearTimeout(timeoutId);
      showTrack(info);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [track]);

  return (
    <SpotifyCardScrollTracker>
      <SpotifyCardShell contentRef={contentRef} gradient={displayTrack.albumGradient}>
        <TrackListing track={displayTrack} />
      </SpotifyCardShell>
    </SpotifyCardScrollTracker>
  );
}
