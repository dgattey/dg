'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { musicDestinationTitle } from '../layouts/musicHeaderDestinations';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

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

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeRoute) {
      event.preventDefault();
      scrollToNowPlayingCard();
    } else if (pathname === musicRoute) {
      event.preventDefault();
      window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  return (
    <div className="spotify__headerSlot">
      <PageTransitionLink
        className="chrome__nowPlayingLink"
        href={musicRoute}
        onClick={handleClick}
        title={musicDestinationTitle(musicRoute)}
      >
        <div data-spotify-header-container="">
          <PaperCard
            edge="quad-a"
            innerClassName="chrome__nowPlayingInner paperInnerUnclipped"
            tiltDeg={1}
            tone="cream"
          >
            <TrackListing disableLinks={true} track={track} variant="compact" />
          </PaperCard>
        </div>
      </PageTransitionLink>
    </div>
  );
}
