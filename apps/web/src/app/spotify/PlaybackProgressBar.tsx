'use client';

import { type CSSProperties, useEffect, useRef } from 'react';

const PROGRESS_UPDATE_INTERVAL_MS = 2000;

type PlaybackProgressBarProps = {
  durationMs?: number;
  progressMs?: number;
  isPlaying?: boolean;
  color?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getProgressPercent = (progressMs: number, durationMs: number) =>
  durationMs > 0 ? clamp(progressMs / durationMs, 0, 1) : 0;

export function PlaybackProgressBar({
  durationMs,
  progressMs,
  isPlaying,
  color,
}: PlaybackProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const startProgressRef = useRef<number>(progressMs ?? 0);
  const hasTiming = durationMs !== undefined && durationMs > 0 && progressMs !== undefined;
  const initialProgress = hasTiming ? getProgressPercent(progressMs, durationMs) : 0;
  const resolvedColor = color ?? 'var(--dg-palette-text-primary)';

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || durationMs === undefined || durationMs <= 0 || progressMs === undefined) {
      return;
    }
    startTimeRef.current = Date.now();
    startProgressRef.current = clamp(progressMs, 0, durationMs);
    const apply = () => {
      const elapsedMs = isPlaying ? Date.now() - startTimeRef.current : 0;
      const nextMs = clamp(startProgressRef.current + elapsedMs, 0, durationMs);
      const ratio = getProgressPercent(nextMs, durationMs);
      bar.style.setProperty('--progress-scale', ratio.toFixed(4));
    };
    apply();
    if (!isPlaying) {
      return;
    }
    const intervalId = window.setInterval(apply, PROGRESS_UPDATE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [durationMs, isPlaying, progressMs]);

  if (!hasTiming) {
    return null;
  }

  return (
    <div
      aria-hidden={true}
      data-playback-progress-track=""
      style={{ '--progress-color': resolvedColor } as CSSProperties}
    >
      <div
        data-playback-progress-bar=""
        ref={barRef}
        style={{ '--progress-scale': initialProgress.toFixed(4) } as CSSProperties}
      />
    </div>
  );
}
