'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { pauseAnimationsOnScroll } from './useWaveformBounce';

type NotesVariant = 'collage' | 'collageCompact';

type MusicNotesProps = {
  isPlaying: boolean;
  noteColor?: string;
  variant?: NotesVariant;
};

type NoteSlot = {
  angle: number;
  delayMs: number;
  distance: number;
  durationMs: number;
  iconIndex: number;
};

type NotesConfig = {
  iconSize: number;
  opacityMid: number;
  opacityStart: number;
  slots: ReadonlyArray<NoteSlot>;
  startDistance: number;
  strokeWidth: number;
};

const MUSIC_ICONS = [Music, Music2, Music3, Music4];

const NOTES_CONFIG: Record<NotesVariant, NotesConfig> = {
  collage: {
    iconSize: 17,
    opacityMid: 0.9,
    opacityStart: 1,
    slots: [
      { angle: 28, delayMs: 0, distance: 178, durationMs: 2800, iconIndex: 0 },
      { angle: 82, delayMs: 420, distance: 196, durationMs: 3100, iconIndex: 1 },
      { angle: 142, delayMs: 840, distance: 172, durationMs: 2900, iconIndex: 2 },
      { angle: 204, delayMs: 1260, distance: 192, durationMs: 3200, iconIndex: 3 },
      { angle: 266, delayMs: 1680, distance: 184, durationMs: 3000, iconIndex: 0 },
      { angle: 324, delayMs: 2100, distance: 176, durationMs: 2950, iconIndex: 2 },
    ],
    startDistance: 98,
    strokeWidth: 2.25,
  },
  collageCompact: {
    iconSize: 14,
    opacityMid: 0.85,
    opacityStart: 0.95,
    slots: [
      { angle: 35, delayMs: 0, distance: 42, durationMs: 2100, iconIndex: 0 },
      { angle: 135, delayMs: 520, distance: 46, durationMs: 2300, iconIndex: 1 },
      { angle: 225, delayMs: 1040, distance: 40, durationMs: 2200, iconIndex: 2 },
      { angle: 315, delayMs: 1560, distance: 44, durationMs: 2250, iconIndex: 3 },
    ],
    startDistance: 16,
    strokeWidth: 2,
  },
};

const notesContainerSx: SxObject = {
  backfaceVisibility: 'hidden',
  height: 0,
  left: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width: 0,
};

const noteItemSx: SxObject = {
  backfaceVisibility: 'hidden',
  left: 0,
  opacity: 0.01,
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
};

export function MusicNotes({ isPlaying, noteColor, variant = 'collage' }: MusicNotesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = NOTES_CONFIG[variant];
  const halfIcon = -Math.round(config.iconSize / 2);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isPlaying) {
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const children = [...container.children] as Array<HTMLElement>;
    const animations: Array<Animation> = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const slot = config.slots[i];
      if (!child || !slot || typeof child.animate !== 'function') {
        continue;
      }
      const rad = (slot.angle * Math.PI) / 180;
      const x0 = Math.round(Math.cos(rad) * config.startDistance);
      const y0 = Math.round(Math.sin(rad) * config.startDistance);
      const x1 = Math.round(Math.cos(rad) * slot.distance);
      const y1 = Math.round(Math.sin(rad) * slot.distance);
      const rot = slot.angle > 180 ? -24 : 24;

      const anim = child.animate(
        [
          {
            opacity: 0.01,
            transform: `translate3d(${x0}px, ${y0}px, 0) rotate(0deg)`,
          },
          {
            offset: 0.12,
            opacity: config.opacityStart,
            transform: `translate3d(${Math.round(x0 + (x1 - x0) * 0.12)}px, ${Math.round(y0 + (y1 - y0) * 0.12)}px, 0) rotate(${Math.round(rot * 0.12)}deg)`,
          },
          {
            offset: 0.55,
            opacity: config.opacityMid,
            transform: `translate3d(${Math.round(x0 + (x1 - x0) * 0.55)}px, ${Math.round(y0 + (y1 - y0) * 0.55)}px, 0) rotate(${Math.round(rot * 0.55)}deg)`,
          },
          {
            opacity: 0.01,
            transform: `translate3d(${x1}px, ${y1}px, 0) rotate(${rot}deg)`,
          },
        ],
        {
          delay: -slot.delayMs,
          duration: slot.durationMs,
          easing: 'ease-out',
          iterations: Number.POSITIVE_INFINITY,
        },
      );
      animations.push(anim);
    }

    return pauseAnimationsOnScroll(animations);
  }, [isPlaying, config]);

  if (!isPlaying) {
    return null;
  }

  return (
    <Box
      aria-hidden="true"
      data-ambient-notes="true"
      ref={containerRef}
      style={{ color: noteColor ?? 'currentColor' }}
      sx={notesContainerSx}
    >
      {config.slots.map((slot) => {
        const IconComponent = MUSIC_ICONS[slot.iconIndex];
        if (!IconComponent) {
          return null;
        }
        return (
          <Box
            key={`${slot.angle}-${slot.delayMs}`}
            style={{ marginLeft: halfIcon, marginTop: halfIcon }}
            sx={noteItemSx}
          >
            <IconComponent size={config.iconSize} strokeWidth={config.strokeWidth} />
          </Box>
        );
      })}
    </Box>
  );
}
