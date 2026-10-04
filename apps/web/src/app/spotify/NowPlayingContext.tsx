'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type NowPlayingContextValue = {
  publish: (track: Track) => void;
  track: Track | null;
};

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

/**
 * Shares the newest server-rendered track across the page. The header card
 * lives in the layout, which client navigations keep as-is, so on its own it
 * would show the track from the first page load while the page's widget shows
 * the track fetched for the current page.
 */
export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const value = useMemo(() => ({ publish: setTrack, track }), [track]);
  return <NowPlayingContext.Provider value={value}>{children}</NowPlayingContext.Provider>;
}

/**
 * Publishes `track` as the newest one whenever the server sends it. No-op
 * outside the provider.
 */
export function usePublishNowPlaying(track: Track) {
  const publish = useContext(NowPlayingContext)?.publish;
  useEffect(() => {
    publish?.(track);
  }, [publish, track]);
}

/**
 * Publishes `track`, then returns the newest published track, falling back to
 * `track` until something is published or outside the provider.
 */
export function useNowPlaying(track: Track): Track {
  usePublishNowPlaying(track);
  return useContext(NowPlayingContext)?.track ?? track;
}
