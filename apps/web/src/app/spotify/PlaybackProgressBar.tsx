'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PROGRESS_UPDATE_INTERVAL_MS = 250;
const REFRESH_BUFFER_MS = 500;

type PlaybackProgressBarProps = {
  durationMs?: number;
  progressMs?: number;
  isPlaying?: boolean;
  color?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getProgressPercent = (progressMs: number, durationMs: number) =>
  durationMs > 0 ? clamp(progressMs / durationMs, 0, 1) : 0;

/**
 * Shows a small progress bar for the current Spotify track and refreshes
 * the router when the track ends.
 */
export function PlaybackProgressBar({
  durationMs,
  progressMs,
  isPlaying,
  color,
}: PlaybackProgressBarProps) {
  const router = useRouter();
  const hasTiming = durationMs !== undefined && durationMs > 0 && progressMs !== undefined;
  const [progress, setProgress] = useState(() =>
    hasTiming ? getProgressPercent(progressMs, durationMs) : 0,
  );
  const startTimeRef = useRef<number>(0);
  const startProgressRef = useRef<number>(progressMs ?? 0);
  const resolvedColor = color ?? 'var(--mui-palette-text-primary)';
  const trackSx: SxObject = {
    backgroundColor: `color-mix(in srgb, ${resolvedColor} 20%, transparent)`,
    borderRadius: 999,
    height: 6,
    marginTop: 2,
    overflow: 'hidden',
    pointerEvents: 'none',
    width: '100%',
  };
  const progressSx: SxObject = {
    backgroundColor: resolvedColor,
    borderRadius: 'inherit',
    height: '100%',
    transform: `scaleX(${progress})`,
    transformOrigin: 'left',
    transition: `transform ${PROGRESS_UPDATE_INTERVAL_MS}ms linear`,
    width: '100%',
  };

  // When the server sends fresh timing data, reset our baseline and snap the bar.
  useEffect(() => {
    if (durationMs === undefined || durationMs <= 0 || progressMs === undefined) {
      return;
    }
    startTimeRef.current = Date.now();
    startProgressRef.current = clamp(progressMs, 0, durationMs);
    setProgress(getProgressPercent(progressMs, durationMs));
  }, [durationMs, progressMs]);

  // While playing, advance locally on an interval so the bar moves smoothly
  // without forcing a router refresh each tick.
  useEffect(() => {
    if (durationMs === undefined || durationMs <= 0 || progressMs === undefined || !isPlaying) {
      return;
    }
    const updateProgress = () => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const nextProgressMs = clamp(startProgressRef.current + elapsedMs, 0, durationMs);
      setProgress(getProgressPercent(nextProgressMs, durationMs));
    };

    updateProgress();
    const intervalId = window.setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [durationMs, isPlaying, progressMs]);

  // Schedule a single refresh when the song should end so the server
  // can provide the next track or played-at state.
  useEffect(() => {
    if (durationMs === undefined || durationMs <= 0 || progressMs === undefined || !isPlaying) {
      return;
    }
    const remainingMs = durationMs - progressMs;
    if (remainingMs <= 0) {
      router.refresh();
      return;
    }
    const timeoutId = window.setTimeout(() => {
      router.refresh();
    }, remainingMs + REFRESH_BUFFER_MS);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs, isPlaying, progressMs, router]);

  if (!hasTiming) {
    return null;
  }

  return (
    <Box aria-hidden={true} sx={trackSx}>
      <Box sx={progressSx} />
    </Box>
  );
}
