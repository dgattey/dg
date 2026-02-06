'use client';

import type { SxProps } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PROGRESS_UPDATE_INTERVAL_MS = 500;
const REFRESH_BUFFER_MS = 250;

type PlaybackProgressBarProps = {
  durationMs?: number;
  progressMs?: number;
  isPlaying?: boolean;
  isDark?: boolean;
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
  isDark,
}: PlaybackProgressBarProps) {
  const router = useRouter();
  const hasTiming = durationMs !== undefined && durationMs > 0 && progressMs !== undefined;
  const [progress, setProgress] = useState(() =>
    hasTiming ? getProgressPercent(progressMs, durationMs) : 0,
  );
  const startTimeRef = useRef<number>(0);
  const startProgressRef = useRef<number>(progressMs ?? 0);
  const trackSx: SxProps = (theme) => ({
    backgroundColor:
      isDark === undefined
        ? `color-mix(in srgb, ${theme.vars.palette.text.primary} 20%, transparent)`
        : isDark
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(0, 0, 0, 0.2)',
    borderRadius: 999,
    height: 6,
    marginTop: theme.spacing(2),
    overflow: 'hidden',
    pointerEvents: 'none',
    width: '100%',
  });
  const progressSx: SxProps = (theme) => ({
    backgroundColor:
      isDark === undefined
        ? theme.vars.palette.text.primary
        : isDark
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(0, 0, 0, 0.6)',
    borderRadius: 'inherit',
    height: '100%',
    transform: `scaleX(${progress})`,
    transformOrigin: 'left',
    transition: `transform ${PROGRESS_UPDATE_INTERVAL_MS}ms linear`,
    width: '100%',
  });

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
