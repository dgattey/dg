'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Box } from '@dg/ui/core/Box';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { TIMING_MEDIUM } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { musicDestinationLabel } from '../layouts/musicHeaderDestinations';
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
  // A single-line title's min-content is its full text, so the paper must opt into shrinking.
  '& > .paperWrap': {
    minWidth: 0,
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

type SpotifyHeaderCardProps = {
  track: Track | null;
};

function scrollToNowPlayingCard() {
  document.getElementById(NOW_PLAYING_CARD_ID)?.scrollIntoView({ behavior: 'smooth' });
}

export function SpotifyHeaderCard({ track: serverTrack }: SpotifyHeaderCardProps) {
  const track = useNowPlaying(serverTrack);
  return track ? <DockedHeaderCard track={track} /> : null;
}

function DockedHeaderCard({ track }: { track: Track }) {
  const pathname = usePathname() ?? '/';
  const isHome = pathname === homeRoute;
  const isMusic = pathname === musicRoute;
  const opensMusicPage = !isHome && !isMusic;
  // State rather than a ref: wrapping the card in a link remounts it, and the observer must follow.
  const [cardElement, setCardElement] = useState<HTMLElement | null>(null);
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    if (!cardElement) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '20px', threshold: 0 },
    );
    observer.observe(cardElement);
    return () => observer.disconnect();
  }, [cardElement]);

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
      ref={setCardElement}
      role={isHome ? 'button' : undefined}
      sx={getContainerSx(isHome || opensMusicPage)}
      tabIndex={isHome ? 0 : undefined}
    >
      <PaperCard
        edge="quad-a"
        innerClassName="chrome__nowPlayingInner paperInnerUnclipped"
        tiltDeg={1}
        tone="cream"
      >
        <TrackListing
          disableLinks={isHome || opensMusicPage}
          shouldAnimate={isInViewport}
          track={track}
          variant="compact"
        />
      </PaperCard>
    </Box>
  );

  return (
    <Box sx={slotSx}>
      {opensMusicPage ? (
        <PageTransitionLink
          className="chrome__nowPlayingLink"
          href={musicRoute}
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
