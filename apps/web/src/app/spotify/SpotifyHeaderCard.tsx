'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@dg/ui/core/Box';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { TIMING_MEDIUM } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { useEffect, useRef, useState } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { musicDestinationLabel } from '../layouts/musicHeaderDestinations';
import { usePublicPathname } from '../layouts/usePublicPathname';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

const getContainerSx = (isClickable: boolean): SxObject => ({
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
  cursor: isClickable ? 'pointer' : undefined,
  display: 'flex',
  flexShrink: 1,
  maxWidth: 'max(25vw, 16rem)',
  minWidth: 0,
  overflow: 'visible',
  transformOrigin: 'left center',
});

const slotSx: SxObject = {
  alignItems: 'center',
  display: 'grid',
  gridTemplateColumns: '1fr',
  justifyItems: 'start',
  maxWidth: '100%',
  minWidth: 0,
  ml: 1,
};

const musicLinkSx: SxObject = {
  color: 'inherit',
  display: 'block',
  minWidth: 0,
  textDecoration: 'none',
};

type SpotifyHeaderCardProps = {
  surface?: SiteSurface;
  /** Server track; the newest published one wins. Null renders nothing until one is published. */
  track: Track | null;
};

function scrollToNowPlayingCard() {
  document.getElementById(NOW_PLAYING_CARD_ID)?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Docked Spotify card in the header, always shown. Manages viewport detection
 * for animation pausing and home-page scroll-to-card behavior.
 * Off-home (and not already on music) navigates to listening history.
 * Track display is delegated to TrackListing variant="compact".
 */
export function SpotifyHeaderCard({
  surface = 'classic',
  track: serverTrack,
}: SpotifyHeaderCardProps) {
  const track = useNowPlaying(serverTrack);
  return track ? <DockedHeaderCard surface={surface} track={track} /> : null;
}

function DockedHeaderCard({ surface, track }: { surface: SiteSurface; track: Track }) {
  const pathname = usePublicPathname();
  const isHome = pathname === homeRoute;
  const isMusic = pathname === musicRoute;
  const opensMusicPage = !isHome && !isMusic;
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

  const listing = (
    <TrackListing
      disableLinks={isHome || opensMusicPage}
      shouldAnimate={isInViewport}
      surface={surface}
      track={track}
      variant="compact"
    />
  );
  const card = (
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
      sx={getContainerSx(isHome || opensMusicPage)}
      tabIndex={isHome ? 0 : undefined}
    >
      {surface === 'collage' ? (
        <PaperCard edge="quad-a" innerClassName="chrome__nowPlayingInner" tiltDeg={1} tone="cream">
          {listing}
        </PaperCard>
      ) : (
        listing
      )}
    </Box>
  );

  return (
    <Box sx={slotSx}>
      {opensMusicPage ? (
        <PageTransitionLink
          href={musicRoute}
          sx={musicLinkSx}
          title={musicDestinationLabel(musicRoute)}
        >
          {card}
        </PageTransitionLink>
      ) : (
        card
      )}
    </Box>
  );
}
