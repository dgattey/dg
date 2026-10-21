'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NotesVariant = 'collage' | 'collageCompact';

type MusicNotesProps = {
  isPlaying: boolean;
  noteColor?: string;
  variant?: NotesVariant;
};

type MusicNote = {
  id: number;
  angle: number;
  scale: number;
  duration: number;
  icon: number;
  distance: number;
  delay: number;
};

type NotesConfig = {
  delayMaxMs: number;
  distanceMin: number;
  distanceRange: number;
  durationMs: number;
  durationRandomMs: number;
  filter: string;
  iconSize: number;
  maxNotes: number;
  opacity: readonly [number, number, number];
  scaleMin: number;
  scaleRange: number;
  startDistance: number;
  strokeWidth: number;
};

const MUSIC_ICONS = [Music, Music2, Music3, Music4];
const NOTE_SPAWN_INTERVAL_MS = 280;

const NOTES_CONFIG: Record<NotesVariant, NotesConfig> = {
  collage: {
    delayMaxMs: 80,
    distanceMin: 168,
    distanceRange: 64,
    durationMs: 3000,
    durationRandomMs: 600,
    filter: 'drop-shadow(0 1.5px 0 rgba(0, 0, 0, 0.55)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))',
    iconSize: 17,
    maxNotes: 18,
    opacity: [1, 0.95, 0.6],
    scaleMin: 0.85,
    scaleRange: 0.3,
    startDistance: 98,
    strokeWidth: 2.25,
  },
  collageCompact: {
    delayMaxMs: 60,
    distanceMin: 36,
    distanceRange: 24,
    durationMs: 2200,
    durationRandomMs: 400,
    filter:
      'drop-shadow(0 0 1.5px light-dark(rgba(247, 241, 226, 0.95), rgba(0, 0, 0, 0.7))) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
    iconSize: 14,
    maxNotes: 12,
    opacity: [1, 0.9, 0.5],
    scaleMin: 0.78,
    scaleRange: 0.24,
    startDistance: 16,
    strokeWidth: 2,
  },
};

const notesContainerSx: SxObject = {
  '@keyframes musicNoteFloatAndFade': {
    '0%': {
      opacity: 0,
      transform:
        'translate3d(calc(-50% + var(--note-x0)), calc(-50% + var(--note-y0)), 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(0deg)',
    },
    '8%': {
      opacity: 'var(--note-opacity-start)',
      transform:
        'translate3d(calc(-50% + var(--note-x0) + (var(--note-x) - var(--note-x0)) * 0.08), calc(-50% + var(--note-y0) + (var(--note-y) - var(--note-y0)) * 0.08), 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(calc(var(--note-rotation) * 0.08))',
    },
    '50%': {
      opacity: 'var(--note-opacity-mid)',
    },
    '80%': {
      opacity: 'var(--note-opacity-end)',
    },
    '100%': {
      opacity: 0,
      transform:
        'translate3d(calc(-50% + var(--note-x)), calc(-50% + var(--note-y)), 0) scale3d(calc(var(--note-scale) * 0.7), calc(var(--note-scale) * 0.7), 1) rotate(var(--note-rotation))',
    },
  },
  backfaceVisibility: 'hidden',
  height: 0,
  left: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width: 0,
};

const getContainerSx = ({ filter, opacity }: NotesConfig): SxObject => ({
  ...notesContainerSx,
  '--note-opacity-end': opacity[2],
  '--note-opacity-mid': opacity[1],
  '--note-opacity-start': opacity[0],
  '--note-shadow': filter,
});

const getNoteSx = (note: MusicNote, startDistance: number, noteColor?: string): SxObject => {
  const x = Math.cos((note.angle * Math.PI) / 180);
  const y = Math.sin((note.angle * Math.PI) / 180);
  return {
    '--note-rotation': `${note.angle > 180 ? -25 : 25}deg`,
    '--note-scale': note.scale,
    '--note-x': `${x * note.distance}px`,
    '--note-x0': `${x * startDistance}px`,
    '--note-y': `${y * note.distance}px`,
    '--note-y0': `${y * startDistance}px`,
    animation: `musicNoteFloatAndFade ${note.duration}ms ease-out forwards`,
    animationDelay: `${note.delay}ms`,
    backfaceVisibility: 'hidden',
    color: noteColor ?? 'currentColor',
    filter: 'var(--note-shadow)',
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    willChange: 'transform, opacity',
  };
};

export function MusicNotes({ isPlaying, noteColor, variant = 'collage' }: MusicNotesProps) {
  const [notes, setNotes] = useState<Array<MusicNote>>([]);
  const noteIdRef = useRef(0);
  const config = NOTES_CONFIG[variant];

  useEffect(() => {
    if (!isPlaying) {
      setNotes([]);
      return;
    }

    const spawnNote = () => {
      const id = noteIdRef.current++;
      const newNote: MusicNote = {
        angle: Math.random() * 360,
        delay: Math.random() * config.delayMaxMs,
        distance: config.distanceMin + Math.random() * config.distanceRange,
        duration: config.durationMs + Math.random() * config.durationRandomMs,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: config.scaleMin + Math.random() * config.scaleRange,
      };

      setNotes((prev) => [...prev, newNote].slice(-config.maxNotes));

      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }, newNote.duration + newNote.delay);
    };

    spawnNote();
    setTimeout(spawnNote, 60);
    setTimeout(spawnNote, 120);
    setTimeout(spawnNote, 180);

    const intervalId = setInterval(spawnNote, NOTE_SPAWN_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isPlaying, config]);

  if (!isPlaying) {
    return null;
  }

  return (
    <Box aria-hidden="true" sx={getContainerSx(config)}>
      {notes.map((note) => {
        const IconComponent = MUSIC_ICONS[note.icon];
        if (!IconComponent) {
          return null;
        }
        return (
          <Box key={note.id} sx={getNoteSx(note, config.startDistance, noteColor)}>
            <IconComponent size={config.iconSize} strokeWidth={config.strokeWidth} />
          </Box>
        );
      })}
    </Box>
  );
}
