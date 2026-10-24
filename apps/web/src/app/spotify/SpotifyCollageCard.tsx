'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { type CSSProperties, useEffect, useState } from 'react';
import { type AlbumGradientInformation, extractAlbumGradientFromUrl } from './extractAlbumGradient';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

const collageCardStyle: CSSProperties = { gridArea: 'sp', scrollMarginTop: 120 };

function useAlbumGradient(track: Track): Track {
  const [gradientInformation, setGradientInformation] = useState<AlbumGradientInformation>({
    backgroundGradient: track.albumGradient ?? null,
    contrastSetting: track.albumGradientContrastSetting ?? null,
  });

  useEffect(() => {
    let cancelled = false;
    extractAlbumGradientFromUrl(track.albumImage.url).then((info) => {
      if (!cancelled) {
        setGradientInformation(info);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [track.albumImage.url]);

  return {
    ...track,
    albumGradient: gradientInformation.backgroundGradient ?? undefined,
    albumGradientContrastSetting: gradientInformation.contrastSetting ?? undefined,
  };
}

export function SpotifyCollageCard({ track: serverTrack }: { track: Track | null }) {
  const track = useNowPlaying(serverTrack);
  return track ? <CollageCardWithGradient track={track} /> : null;
}

function CollageCardWithGradient({ track }: { track: Track }) {
  const trackWithGradient = useAlbumGradient(track);
  return (
    <div className="home__spotifySlot" id={NOW_PLAYING_CARD_ID} style={collageCardStyle}>
      <TrackListing track={trackWithGradient} />
    </div>
  );
}
