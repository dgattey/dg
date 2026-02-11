'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { createTransition, TIMING_MEDIUM, TIMING_NORMAL, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePageScrollProgress } from '../layouts/PageScrollContext';
import { NOW_PLAYING_CARD_ID } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

/**
 * Outer container with entrance animation. Scroll progress drives opacity.
 */
const getContainerSx = (scrollProgress: number, isHome: boolean): SxObject => ({
  '@keyframes headerCardEnter': {
    from: {
      transform: 'translateX(-8px)',
    },
    to: {
      transform: 'translateX(0)',
    },
  },
  alignItems: 'center',
  animation: `headerCardEnter ${TIMING_MEDIUM}ms ease-out`,
  cursor: isHome ? 'pointer' : undefined,
  display: 'flex',
  flexShrink: 1,
  maxWidth: 'max(25vw, 16rem)',
  minWidth: 0,
  opacity: scrollProgress,
  overflow: 'visible',
  pointerEvents: scrollProgress > 0.1 ? 'auto' : 'none',
  transformOrigin: 'left center',
  transition: createTransition('opacity', TIMING_NORMAL),
  willChange: 'opacity',
});

/**
 * Grid wrapper: 0fr→1fr animates width so the section can collapse/expand horizontally.
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

/** Allows the grid parent to collapse content to zero in both axes. */
const getCollapsibleInnerSx = (isVisible: boolean): SxObject => ({
  maxWidth: '100%',
  minHeight: 0,
  minWidth: 0,
  overflow: isVisible ? 'visible' : 'hidden',
});

type SpotifyHeaderCardProps = {
  track: Track;
};

function scrollToNowPlayingCard() {
  document.getElementById(NOW_PLAYING_CARD_ID)?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Docked Spotify card in the header. Manages scroll-based visibility,
 * viewport detection for animation pausing, and home-page scroll-to-card behavior.
 * Track display is delegated to TrackListing variant="compact".
 */
export function SpotifyHeaderCard({ track }: SpotifyHeaderCardProps) {
  const pathname = usePathname();
  const scrollContext = usePageScrollProgress();
  const isHome = pathname === '/';
  // null = not measured yet; on home page stay hidden until measured, elsewhere show immediately
  const scrollProgress = scrollContext?.scrollProgress ?? (isHome ? 0 : 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);

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

  const isVisible = scrollProgress > 0.01;

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
          <TrackListing
            disableLinks={isHome}
            shouldAnimate={isInViewport}
            track={track}
            variant="compact"
          />
        </Box>
      </Box>
    </Box>
  );
}
