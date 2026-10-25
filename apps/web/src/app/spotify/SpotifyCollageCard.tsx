'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { useEffect, useState } from 'react';
import { type AlbumColors, extractAlbumColorsFromUrl } from './extractAlbumGradient';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

/**
 * Keeps the last track's colors until the new art is sampled, so the card
 * crossfades between meshes instead of flashing back to bare paper.
 */
function useAlbumColors(url: string): AlbumColors | null {
  const [albumColors, setAlbumColors] = useState<AlbumColors | null>(null);

  useEffect(() => {
    let cancelled = false;
    extractAlbumColorsFromUrl(url).then((colors) => {
      if (!cancelled && colors) {
        setAlbumColors(colors);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return albumColors;
}

export function SpotifyCollageCard({ track: serverTrack }: { track: Track | null }) {
  const track = useNowPlaying(serverTrack);
  return track ? <CollageCardWithColors track={track} /> : null;
}

function CollageCardWithColors({ track }: { track: Track }) {
  const albumColors = useAlbumColors(track.albumImage.url);
  return (
    <div className="home__spotifySlot" id={NOW_PLAYING_CARD_ID}>
      <TrackListing albumColors={albumColors} track={track} />
    </div>
  );
}
