'use client';

import { type CSSProperties, useEffect, useRef } from 'react';

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
  const hasTiming = durationMs !== undefined && durationMs > 0 && progressMs !== undefined;
  const initialProgress = hasTiming ? getProgressPercent(progressMs, durationMs) : 0;
  const resolvedColor = color ?? 'var(--dg-palette-text-primary)';

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || durationMs === undefined || durationMs <= 0 || progressMs === undefined) {
      return;
    }
    const clampedStartMs = clamp(progressMs, 0, durationMs);
    const startRatio = getProgressPercent(clampedStartMs, durationMs);
    bar.style.setProperty('--progress-scale', startRatio.toFixed(4));

    if (
      !isPlaying ||
      clampedStartMs >= durationMs ||
      typeof bar.animate !== 'function' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const remainingMs = durationMs - clampedStartMs;
    const animation = bar.animate(
      [{ transform: `scaleX(${startRatio.toFixed(5)})` }, { transform: 'scaleX(1)' }],
      {
        duration: remainingMs,
        easing: 'linear',
        fill: 'forwards',
      },
    );

    return () => {
      animation.cancel();
    };
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
