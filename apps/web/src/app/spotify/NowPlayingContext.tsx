'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { loadLatestSong } from '../../services/spotify.actions';

export const NOW_PLAYING_CARD_ID = 'now-playing-card';

const POLL_INTERVAL_MS = 30_000;
const MIN_TRACK_END_DELAY_MS = 5_000;
const MIN_FOCUS_REFRESH_GAP_MS = 5_000;
const TRACK_END_BUFFER_MS = 1_500;
const SESSION_STORAGE_KEY = 'dg:now-playing';
const MAX_SESSION_CACHE_AGE_MS = 10 * 60 * 1000;

const NowPlayingContext = createContext<Track | null>(null);

function readSessionTrack(): Track | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { savedAt?: number; track?: Track };
    if (
      !parsed?.track ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > MAX_SESSION_CACHE_AGE_MS
    ) {
      return null;
    }
    return parsed.track;
  } catch {
    return null;
  }
}

function writeSessionTrack(track: Track): void {
  try {
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), track }),
    );
  } catch {
    return;
  }
}

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

function isSameTrack(a: Track | null, b: Track): boolean {
  return (
    a !== null &&
    a.id === b.id &&
    a.isPlaying === b.isPlaying &&
    a.playedAt === b.playedAt &&
    a.progressMs === b.progressMs
  );
}

async function refreshLatestSong(
  requestIdRef: { current: number },
  inFlightRef: { current: boolean },
  lastCompletedAtRef: { current: number },
  setTrack: (updater: (prev: Track | null) => Track | null) => void,
) {
  if (inFlightRef.current) {
    return;
  }
  inFlightRef.current = true;
  const requestId = ++requestIdRef.current;
  try {
    const latest = await loadLatestSong();
    if (latest && requestIdRef.current === requestId) {
      writeSessionTrack(latest);
      setTrack((prev) => (isSameTrack(prev, latest) ? prev : latest));
    }
  } catch {
    return;
  } finally {
    inFlightRef.current = false;
    lastCompletedAtRef.current = Date.now();
  }
}

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const pathname = usePathname();
  const lastPathnameRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);
  const lastCompletedAtRef = useRef(0);

  useLayoutEffect(() => {
    const cached = readSessionTrack();
    if (cached) {
      setTrack(cached);
    }
  }, []);

  useEffect(() => {
    if (lastPathnameRef.current === pathname) {
      return;
    }
    lastPathnameRef.current = pathname;
    if (
      lastCompletedAtRef.current > 0 &&
      Date.now() - lastCompletedAtRef.current < MIN_FOCUS_REFRESH_GAP_MS
    ) {
      return;
    }
    void refreshLatestSong(requestIdRef, inFlightRef, lastCompletedAtRef, setTrack);
  }, [pathname]);

  useEffect(() => {
    const refreshIfCooledDown = () => {
      if (Date.now() - lastCompletedAtRef.current < MIN_FOCUS_REFRESH_GAP_MS) {
        return;
      }
      void refreshLatestSong(requestIdRef, inFlightRef, lastCompletedAtRef, setTrack);
    };
    const onFocus = () => {
      refreshIfCooledDown();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshIfCooledDown();
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
          await refreshLatestSong(requestIdRef, inFlightRef, lastCompletedAtRef, setTrack);
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

  return <NowPlayingContext.Provider value={track}>{children}</NowPlayingContext.Provider>;
}

export function useNowPlaying(track: Track | null): Track | null {
  return useContext(NowPlayingContext) ?? track;
}
