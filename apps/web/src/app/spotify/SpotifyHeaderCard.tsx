'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { usePathname } from 'next/navigation';
import type { CSSProperties, MouseEvent } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { musicDestinationTitle } from '../layouts/musicHeaderDestinations';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

const HEADER_CARD_CSS = `
[data-spotify-header-container] > .paperWrap {
  min-width: 0;
}
`;

const containerStyle: CSSProperties = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  flexShrink: 1,
  maxWidth: 'max(25vw, 16rem)',
  minWidth: 0,
  overflow: 'visible',
  transformOrigin: 'left center',
};

const slotStyle: CSSProperties = {
  alignItems: 'center',
  display: 'grid',
  gridTemplateColumns: '1fr',
  justifyItems: 'start',
  marginLeft: 8,
  maxWidth: '100%',
  minWidth: 0,
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
    <div style={slotStyle}>
      <style href="dg-spotify-header" precedence="default">
        {HEADER_CARD_CSS}
      </style>
      <PageTransitionLink
        className="chrome__nowPlayingLink"
        href={musicRoute}
        onClick={handleClick}
        title={musicDestinationTitle(musicRoute)}
      >
        <div data-spotify-header-container="" style={containerStyle}>
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
