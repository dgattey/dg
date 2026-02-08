'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import {
  createTransition,
  EASING_BOUNCE,
  TIMING_MEDIUM,
  TIMING_NORMAL,
  TIMING_SLOW,
} from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Card, Stack, Typography } from '@mui/material';
import { Music } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import { getContrastingColors } from './colors';
import { NOW_PLAYING_CARD_ID } from './SpotifyCardScrollTracker';
import { useSpotifyScrollProgress } from './SpotifyHeaderContext';
import { useWaveformBounce } from './useWaveformBounce';

/** Album art hover scales from the left (GPU). Text shifts via translateX (GPU). */
const THUMBNAIL_SIZE = 44;
const THUMBNAIL_HOVER_SIZE = 84;
const THUMBNAIL_HOVER_SCALE = THUMBNAIL_HOVER_SIZE / THUMBNAIL_SIZE;

/**
 * Exported for header hover area so parent can trigger same scale.
 * Only applies on devices with true hover capability (not touchscreen-only).
 */
export const HEADER_ALBUM_ART_HOVER = {
  '@media (hover: hover)': {
    '[data-album-art]': {
      boxShadow: 'var(--mui-extraShadows-card-hovered)',
      transform: `scale(${THUMBNAIL_HOVER_SCALE})`,
      zIndex: 1,
    },
    '[data-thumbnail-outer]': {
      width: THUMBNAIL_HOVER_SIZE,
    },
  },
} as const;

/**
 * Outer container with entrance animation. Scroll progress drives opacity.
 * Hover scales the album art and expands the thumbnail wrapper width so the whole container grows.
 */
const getContainerSx = (scrollProgress: number, isHome: boolean): SxObject => ({
  '@keyframes headerThumbnailEnter': {
    from: {
      transform: 'translateX(-8px)',
    },
    to: {
      transform: 'translateX(0)',
    },
  },
  alignItems: 'center',
  animation: `headerThumbnailEnter ${TIMING_MEDIUM}ms ease-out`,
  cursor: isHome ? 'pointer' : undefined,
  display: 'flex',
  flexShrink: 1,
  gap: 1,
  maxWidth: 'max(25vw, 16rem)',
  minWidth: 0,
  opacity: scrollProgress,
  overflow: 'visible',
  pointerEvents: scrollProgress > 0.1 ? 'auto' : 'none',
  transformOrigin: 'left center',
  transition: createTransition('opacity', TIMING_NORMAL),
  willChange: 'opacity',
});

/** Wrapper for thumbnail. Width animates on hover to push text and grow container. */
const thumbnailOuterSx: SxObject = {
  flexShrink: 0,
  height: THUMBNAIL_SIZE,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  transition: createTransition('width', TIMING_SLOW, EASING_BOUNCE),
  width: THUMBNAIL_SIZE,
};

/** Thumbnail image wrapper — GPU: transform (scale) only; box-shadow updates on hover without transition. */
const thumbnailCardSx: SxObject = {
  borderRadius: 1,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  height: THUMBNAIL_SIZE,
  overflow: 'hidden',
  position: 'relative',
  transformOrigin: 'left center',
  transition: createTransition('transform', TIMING_SLOW, EASING_BOUNCE),
  width: THUMBNAIL_SIZE,
  willChange: 'transform',
};

/**
 * Shared single-line truncation for header text. Uses classic CSS truncation
 * (not -webkit-box) which works better with nested elements like Link.
 */
const headerTruncated: SxObject = {
  display: 'block',
  lineHeight: 1.2,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Wrapper for text that clips overflow while allowing album art to overflow for hover */
const textWrapperSx: SxObject = {
  flexShrink: 1,
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  width: 'fit-content',
};

/** Track info stack. Text shifts naturally as thumbnail wrapper width changes on hover. */
const textStackSx: SxObject = {
  color: 'var(--mui-palette-text-primary)',
  minWidth: 0,
  width: '100%',
};

/** Status line styling - uses flex for icon alignment */
const statusSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  gap: 0.5,
  lineHeight: 1.2,
  minWidth: 0,
  width: '100%',
};

/** Status text truncation - text-overflow requires block element, not direct flex child */
const statusTextSx: SxObject = {
  flexShrink: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Icon wrapper for bounce animation */
const iconWrapperSx: SxObject = {
  backfaceVisibility: 'hidden',
  display: 'inline-flex',
  flexShrink: 0,
};

/** Title line styling */
const titleSx: SxObject = {
  ...headerTruncated,
};

/** Artist line styling */
const artistSx: SxObject = {
  ...headerTruncated,
  opacity: 0.6,
};

/**
 * Grid wrapper: 0fr→1fr animates width so the section can collapse/expand horizontally.
 * Only animates columns (not rows) to prevent vertical jumping during entrance.
 */
const getWidthWrapperSx = (isVisible: boolean): SxObject => ({
  alignItems: 'center',
  display: 'grid',
  gridTemplateColumns: isVisible ? '1fr' : '0fr',
  justifyItems: 'start',
  minWidth: 0,
  ml: isVisible ? 1 : 0,
  overflow: 'visible',
  transition: createTransition(['grid-template-columns', 'margin-left'], TIMING_SLOW),
});

/** Allows the grid parent to collapse content to zero in both axes. overflow: visible when expanded so notes can extend. */
const getCollapsibleInnerSx = (isVisible: boolean): SxObject => ({
  maxWidth: '100%',
  minHeight: 0,
  minWidth: 0,
  overflow: isVisible ? 'visible' : 'hidden',
});

type SpotifyHeaderThumbnailProps = {
  track: Track;
};

/**
 * Docked Spotify thumbnail in the header. Shows album art with
 * status/track/artist text. Album art and music icon bounce when playing.
 * Album art expands on hover for subtle feedback.
 */
function scrollToNowPlayingCard() {
  document.getElementById(NOW_PLAYING_CARD_ID)?.scrollIntoView({ behavior: 'smooth' });
}

export function SpotifyHeaderThumbnail({ track }: SpotifyHeaderThumbnailProps) {
  const pathname = usePathname();
  const scrollContext = useSpotifyScrollProgress();
  const isHome = pathname === '/';
  // null = not measured yet; on home page stay hidden until measured, elsewhere show immediately
  const scrollProgress = scrollContext?.scrollProgress ?? (isHome ? 0 : 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);

  const isPlaying = track.isPlaying ?? false;
  const shouldAnimate = isPlaying && isInViewport;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '20px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const iconBounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8,
    isPlaying: shouldAnimate,
  });

  const isVisible = scrollProgress > 0.01;

  const trackUrl = track.externalUrls.spotify;
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const albumImageUrl = track.albumImage.url;
  const colors = getContrastingColors(track);

  const statusText = isPlaying
    ? 'Now Playing'
    : track.relativePlayedAt
      ? `Played ${track.relativePlayedAt}`
      : 'Just Played';

  return (
    <Box aria-hidden={!isVisible} sx={getWidthWrapperSx(isVisible)}>
      <Box sx={getCollapsibleInnerSx(isVisible)}>
        <Box
          onClick={isHome ? scrollToNowPlayingCard : undefined}
          onKeyDown={
            isHome
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToNowPlayingCard();
                  }
                }
              : undefined
          }
          ref={containerRef}
          role={isHome ? 'button' : undefined}
          sx={getContainerSx(scrollProgress, isHome)}
          tabIndex={isHome ? 0 : undefined}
        >
          <Box data-thumbnail-outer sx={thumbnailOuterSx}>
            <AlbumArtWithNotes
              isPlaying={isPlaying}
              noteColor={colors?.primary}
              notesVariant="compact"
              shouldAnimate={isInViewport}
              wrapperSx={{ height: THUMBNAIL_SIZE, width: THUMBNAIL_SIZE }}
            >
              {isHome ? (
                <Box component="span" sx={{ display: 'block' }}>
                  <Card data-album-art sx={thumbnailCardSx}>
                    <Image
                      alt={albumTitle}
                      fill={true}
                      height={THUMBNAIL_SIZE}
                      sizes={{ extraLarge: THUMBNAIL_SIZE }}
                      url={albumImageUrl}
                      width={THUMBNAIL_SIZE}
                    />
                  </Card>
                </Box>
              ) : (
                <Link href={albumUrl} isExternal={true} title={albumTitle}>
                  <Card data-album-art sx={thumbnailCardSx}>
                    <Image
                      alt={albumTitle}
                      fill={true}
                      height={THUMBNAIL_SIZE}
                      sizes={{ extraLarge: THUMBNAIL_SIZE }}
                      url={albumImageUrl}
                      width={THUMBNAIL_SIZE}
                    />
                  </Card>
                </Link>
              )}
            </AlbumArtWithNotes>
          </Box>
          <Box sx={textWrapperSx}>
            <Stack sx={textStackSx}>
              <Typography sx={statusSx} variant="overline">
                <Box component="span" sx={statusTextSx}>
                  {statusText}
                </Box>
                {isPlaying ? (
                  <Box component="span" ref={iconBounceRef} sx={iconWrapperSx}>
                    <Music size="1em" />
                  </Box>
                ) : null}
              </Typography>
              <Typography sx={titleSx} variant="caption">
                {isHome ? (
                  track.name
                ) : (
                  <Link href={trackUrl} isExternal={true} title={track.name} variant="caption">
                    {track.name}
                  </Link>
                )}
              </Typography>
              <Typography sx={artistSx} variant="caption">
                {track.artists.map((a) => a.name).join(', ')}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
