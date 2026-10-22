'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { loadLatestSong } from '../../services/spotify.actions';

type NowPlayingContextValue = {
  publish: (track: Track) => void;
  track: Track | null;
};

/** The page's now playing card, which the home header pill scrolls to. */
export const NOW_PLAYING_CARD_ID = 'now-playing-card';

const POLL_INTERVAL_MS = 30_000;
const MIN_TRACK_END_DELAY_MS = 5_000;
const TRACK_END_BUFFER_MS = 1_500;

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

function nextRefreshDelayMs(track: Track | null): number {
  if (
    track?.isPlaying &&
    typeof track.durationMs === 'number' &&
    typeof track.progressMs === 'number'
  ) {
    const remainingMs = track.durationMs - track.progressMs + TRACK_END_BUFFER_MS;
    return Math.min(POLL_INTERVAL_MS, Math.max(MIN_TRACK_END_DELAY_MS, remainingMs));
  }
  return POLL_INTERVAL_MS;
}

async function refreshLatestSong(
  inFlightRef: { current: boolean },
  setTrack: (track: Track) => void,
) {
  if (inFlightRef.current) {
    return;
  }
  inFlightRef.current = true;
  try {
    const latest = await loadLatestSong();
    if (latest) {
      setTrack(latest);
    }
  } catch {
    return;
  } finally {
    inFlightRef.current = false;
  }
}

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const pathname = usePathname();
  const lastPathnameRef = useRef(pathname);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (lastPathnameRef.current === pathname) {
      return;
    }
    lastPathnameRef.current = pathname;
    void refreshLatestSong(inFlightRef, setTrack);
  }, [pathname]);

  useEffect(() => {
    const onFocus = () => {
      void refreshLatestSong(inFlightRef, setTrack);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshLatestSong(inFlightRef, setTrack);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const schedule = (delayMs: number) => {
      timer = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }
        if (document.visibilityState !== 'hidden') {
          await refreshLatestSong(inFlightRef, setTrack);
        }
        if (!cancelled) {
          schedule(POLL_INTERVAL_MS);
        }
      }, delayMs);
    };

    schedule(nextRefreshDelayMs(track));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [track]);

  return (
    <NowPlayingContext.Provider value={{ publish: setTrack, track }}>
      {children}
    </NowPlayingContext.Provider>
  );
}

function usePublishNowPlaying(track: Track) {
  const publish = useContext(NowPlayingContext)?.publish;
  useEffect(() => {
    publish?.(track);
  }, [publish, track]);
}

/** Publishes a freshly fetched track without rendering anything. */
export function PublishNowPlaying({ track }: { track: Track }) {
  usePublishNowPlaying(track);
  return null;
}

export function useNowPlaying(track: Track | null): Track | null {
  return useContext(NowPlayingContext)?.track ?? track;
}
