'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type MusicNotesProps = {
  /**
   * Whether the animation should be active
   */
  isPlaying: boolean;
  /**
   * Color for the music notes (defaults to inherited text color)
   */
  noteColor?: string;
  /**
   * Compact variant for small contexts (e.g. header thumbnail)
   */
  variant?: 'default' | 'compact';
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

const MUSIC_ICONS = [Music, Music2, Music3, Music4];
const NOTE_SPAWN_INTERVAL_MS = 280;
const NOTE_LIFETIME_MS = 3000;
const MAX_NOTES = 18;

const COMPACT = {
  distanceMin: 30,
  distanceRange: 28,
  durationMs: 2000,
  durationRandomMs: 400,
  iconSize: 18,
  maxNotes: 10,
  scaleMin: 0.8,
  scaleRange: 0.3,
};

// GPU-accelerated float animation for notes
const floatAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(0deg);
  }
  8% {
    opacity: 0.75;
    transform: translate3d(calc(-50% + var(--note-x) * 0.08), calc(-50% + var(--note-y) * 0.08), 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(calc(var(--note-rotation) * 0.08));
  }
  50% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.25;
  }
  100% {
    opacity: 0;
    transform: translate3d(calc(-50% + var(--note-x)), calc(-50% + var(--note-y)), 0) scale3d(calc(var(--note-scale) * 0.7), calc(var(--note-scale) * 0.7), 1) rotate(var(--note-rotation));
  }
`;

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

const getNoteSx = (note: MusicNote, noteColor?: string): SxObject => ({
  '--note-rotation': `${note.angle > 180 ? -25 : 25}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * note.distance}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * note.distance}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  animationDelay: `${note.delay}ms`,
  backfaceVisibility: 'hidden',
  color: noteColor ?? 'currentColor',
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
  left: 0,
  opacity: 0,
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
});

/**
 * Music notes that emanate from a center point.
 * Place this component where you want the notes to originate from.
 */
export function MusicNotes({ isPlaying, noteColor, variant = 'default' }: MusicNotesProps) {
  const [notes, setNotes] = useState<Array<MusicNote>>([]);
  const noteIdRef = useRef(0);
  const isCompact = variant === 'compact';

  useEffect(() => {
    if (!isPlaying) {
      setNotes([]);
      return;
    }

    const spawnNote = () => {
      const id = noteIdRef.current++;
      const angle = Math.random() * 360;

      const newNote: MusicNote = isCompact
        ? {
            angle,
            delay: Math.random() * 60,
            distance: COMPACT.distanceMin + Math.random() * COMPACT.distanceRange,
            duration: COMPACT.durationMs + Math.random() * COMPACT.durationRandomMs,
            icon: Math.floor(Math.random() * MUSIC_ICONS.length),
            id,
            scale: COMPACT.scaleMin + Math.random() * COMPACT.scaleRange,
          }
        : {
            angle,
            delay: Math.random() * 80,
            distance: 120 + Math.random() * 80,
            duration: NOTE_LIFETIME_MS + Math.random() * 600,
            icon: Math.floor(Math.random() * MUSIC_ICONS.length),
            id,
            scale: 0.85 + Math.random() * 0.35,
          };

      const maxNotes = isCompact ? COMPACT.maxNotes : MAX_NOTES;
      setNotes((prev) => [...prev, newNote].slice(-maxNotes));

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
  }, [isPlaying, isCompact]);

  const iconSize = isCompact ? COMPACT.iconSize : 15;
  const renderedNotes = useMemo(
    () =>
      notes.map((note) => {
        const IconComponent = MUSIC_ICONS[note.icon];
        if (!IconComponent) {
          return null;
        }
        return (
          <Box key={note.id} sx={getNoteSx(note, noteColor)}>
            <IconComponent size={iconSize} />
          </Box>
        );
      }),
    [notes, noteColor, iconSize],
  );

  if (!isPlaying) {
    return null;
  }

  return (
    <Box aria-hidden="true" sx={notesContainerSx}>
      {renderedNotes}
    </Box>
  );
}
