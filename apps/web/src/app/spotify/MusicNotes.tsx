'use client';

import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { type CSSProperties, useEffect, useRef } from 'react';

export type NotesVariant = 'collage' | 'collageCompact';

type MusicNotesProps = {
  isPlaying: boolean;
  noteColor?: string;
  variant?: NotesVariant;
};

type NotesConfig = {
  delayMaxMs: number;
  distanceMin: number;
  distanceRange: number;
  durationMs: number;
  durationRandomMs: number;
  iconSize: number;
  opacity: readonly [number, number, number];
  scaleMin: number;
  scaleRange: number;
  slotIds: ReadonlyArray<string>;
  startDistance: number;
  strokeWidth: number;
};

const MUSIC_ICONS = [Music, Music2, Music3, Music4] as const;
const NOTE_SPAWN_INTERVAL_MS = 280;
const FLIGHTS_PER_LOOP = 3;
/**
 * Keeping minimum opacity at 0.01 prevents Firefox Gecko from tearing down and
 * recreating the `nsDisplayOpacity` stacking context at opacity == 0.0f.
 */
const MIN_COMPOSITOR_OPACITY = 0.01;

export const NOTES_CONFIG: Record<NotesVariant, NotesConfig> = {
  collage: {
    delayMaxMs: 80,
    distanceMin: 210,
    distanceRange: 76,
    durationMs: 3000,
    durationRandomMs: 600,
    iconSize: 17,
    opacity: [1, 0.95, 0.6],
    scaleMin: 0.85,
    scaleRange: 0.3,
    slotIds: [
      'card-note-0',
      'card-note-1',
      'card-note-2',
      'card-note-3',
      'card-note-4',
      'card-note-5',
      'card-note-6',
      'card-note-7',
      'card-note-8',
      'card-note-9',
      'card-note-10',
      'card-note-11',
    ],
    startDistance: 122,
    strokeWidth: 2.25,
  },
  collageCompact: {
    delayMaxMs: 60,
    distanceMin: 36,
    distanceRange: 24,
    durationMs: 2200,
    durationRandomMs: 400,
    iconSize: 14,
    opacity: [1, 0.9, 0.5],
    scaleMin: 0.78,
    scaleRange: 0.24,
    slotIds: [
      'compact-note-0',
      'compact-note-1',
      'compact-note-2',
      'compact-note-3',
      'compact-note-4',
      'compact-note-5',
      'compact-note-6',
      'compact-note-7',
    ],
    startDistance: 16,
    strokeWidth: 2,
  },
};

/**
 * Builds a 3-flight keyframe sequence for one pooled note element using the
 * exact pre-redesign (`e5174284` / `14d1fdae`) `floatAndFade` ease-out trajectory
 * (`0% -> 8% -> 50% -> 80% -> 100%`, `scale -> 0.7 * scale`, `rotate(±25deg)`),
 * with pre-sampled ease-out positions so `easing: 'linear'` + `iterations: Infinity`
 * runs 100% on the GPU compositor thread in Firefox WebRender and Chrome Blink.
 */
export function buildNoteLoopKeyframes(
  slotIndex: number,
  variant: NotesVariant = 'collage',
  rand: () => number = Math.random,
): Array<Keyframe> {
  const cfg = NOTES_CONFIG[variant];
  const slotCount = cfg.slotIds.length;
  const halfIcon = cfg.iconSize / 2;
  const keyframes: Array<Keyframe> = [];

  for (let flight = 0; flight < FLIGHTS_PER_LOOP; flight++) {
    const windowStart = flight / FLIGHTS_PER_LOOP;
    const windowSpan = 1 / FLIGHTS_PER_LOOP;
    const baseAngle = (slotIndex * (360 / slotCount) + flight * 115) % 360;
    const angle = (baseAngle + (rand() - 0.5) * 42 + 360) % 360;
    const distance = cfg.distanceMin + rand() * cfg.distanceRange;
    const scale = cfg.scaleMin + rand() * cfg.scaleRange;
    const rot = angle > 180 ? -25 : 25;

    const rad = (angle * Math.PI) / 180;
    const x0 = Math.cos(rad) * cfg.startDistance;
    const y0 = Math.sin(rad) * cfg.startDistance;
    const x1 = Math.cos(rad) * distance;
    const y1 = Math.sin(rad) * distance;

    const pointAt = (u: number, opacity: number) => {
      // Exact CSS ease-out (`cubic-bezier(0, 0, 0.58, 1)`) curve from 0% -> 8% -> 100%
      const progress =
        u <= 0.08
          ? 0.08 * (1 - (1 - u / 0.08) ** 2.1)
          : 0.08 + 0.92 * (1 - (1 - (u - 0.08) / 0.92) ** 2.1);
      const scaleMult = u <= 0.08 ? 1 : 1 - 0.3 * ((u - 0.08) / 0.92);
      const x = (x0 + (x1 - x0) * progress - halfIcon).toFixed(1);
      const y = (y0 + (y1 - y0) * progress - halfIcon).toFixed(1);
      const s = (scale * scaleMult).toFixed(3);
      const r = (rot * progress).toFixed(1);
      return {
        offset: Number((windowStart + u * windowSpan * 0.96).toFixed(5)),
        opacity,
        transform: `translate3d(${x}px, ${y}px, 0) scale3d(${s}, ${s}, 1) rotate(${r}deg)`,
      };
    };

    const [opStart, opMid, opEnd] = cfg.opacity;
    keyframes.push(
      pointAt(0.0, MIN_COMPOSITOR_OPACITY),
      pointAt(0.08, opStart),
      pointAt(0.28, Number((opStart * 0.65 + opMid * 0.35).toFixed(3))),
      pointAt(0.5, opMid),
      pointAt(0.8, opEnd),
      pointAt(1.0, MIN_COMPOSITOR_OPACITY),
    );
  }

  const firstTransform =
    keyframes[0]?.transform ?? 'translate3d(0px, 0px, 0) scale3d(0.85, 0.85, 1) rotate(0deg)';
  keyframes.push({
    offset: 1,
    opacity: MIN_COMPOSITOR_OPACITY,
    transform: firstTransform,
  });

  return keyframes;
}

export function MusicNotes({ isPlaying, noteColor, variant = 'collage' }: MusicNotesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = NOTES_CONFIG[variant];

  useEffect(() => {
    const container = containerRef.current;
    if (
      !container ||
      !isPlaying ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const noteElements = [...container.querySelectorAll<HTMLElement>('[data-music-note]')];
    const animations: Array<Animation> = [];

    noteElements.forEach((element, slotIndex) => {
      if (typeof element.animate !== 'function') {
        return;
      }
      const singleFlightMs =
        config.durationMs + Math.random() * config.durationRandomMs + slotIndex * 45;
      const totalDurationMs = Math.round(singleFlightMs * FLIGHTS_PER_LOOP);
      const initialDelayMs = -Math.round(
        slotIndex * NOTE_SPAWN_INTERVAL_MS + Math.random() * config.delayMaxMs,
      );

      const anim = element.animate(buildNoteLoopKeyframes(slotIndex, variant), {
        delay: initialDelayMs,
        duration: totalDurationMs,
        easing: 'linear',
        iterations: Number.POSITIVE_INFINITY,
      });
      animations.push(anim);
    });

    return () => {
      for (const anim of animations) {
        anim.cancel();
      }
    };
  }, [isPlaying, config, variant]);

  if (!isPlaying) {
    return null;
  }

  const containerVars = {
    '--note-color': noteColor ?? 'currentColor',
  } as CSSProperties;

  return (
    <div aria-hidden="true" data-ambient-notes={variant} ref={containerRef} style={containerVars}>
      {config.slotIds.map((id, slotIndex) => {
        const IconComponent = MUSIC_ICONS[slotIndex % MUSIC_ICONS.length] ?? Music;
        return (
          <div data-music-note="" key={id}>
            <span aria-hidden="true" data-music-note-shadow="">
              <IconComponent size={config.iconSize} strokeWidth={config.strokeWidth} />
            </span>
            <IconComponent
              data-music-note-fg=""
              size={config.iconSize}
              strokeWidth={config.strokeWidth}
            />
          </div>
        );
      })}
    </div>
  );
}
