'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type PlayingIndicatorProps = {
  /**
   * The album image to wrap with bounce animation
   */
  children: ReactNode;
  /**
   * Whether the animation should be active
   */
  isPlaying: boolean;
};

type MusicNotesProps = {
  /**
   * Whether the animation should be active
   */
  isPlaying: boolean;
  /**
   * Color for the music notes
   */
  noteColor?: string;
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
const NOTE_SPAWN_INTERVAL_MS = 280; // More frequent
const NOTE_LIFETIME_MS = 3000;
const MAX_NOTES = 18; // More notes

// Organic bounce - alternates up/down with slight variation
// Uses different timing for up vs down to feel less mechanical
const albumBounce = keyframes`
  0% {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
  }
  20% {
    transform: scale3d(1.006, 1.006, 1) translate3d(0, -1.5px, 0);
  }
  35% {
    transform: scale3d(1.002, 1.002, 1) translate3d(0, -0.5px, 0);
  }
  50% {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
  }
  65% {
    transform: scale3d(0.998, 0.998, 1) translate3d(0, 1px, 0);
  }
  80% {
    transform: scale3d(1.001, 1.001, 1) translate3d(0, 0.3px, 0);
  }
  100% {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
  }
`;

// GPU-accelerated float animation
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

const getWrapperSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${albumBounce} 0.9s ease-in-out infinite` : 'none',
  backfaceVisibility: 'hidden',
  position: 'relative',
  transform: 'translateZ(0)',
  willChange: isPlaying ? 'transform' : 'auto',
});

// Notes spawn from center point (0,0) and radiate outward
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
  color: noteColor ?? 'rgba(128, 128, 128, 0.8)',
  left: 0,
  opacity: 0, // Start hidden, animation will fade in
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
});

/**
 * Music notes that emanate from a center point.
 * Uses GPU-accelerated animations (transform + opacity only).
 */
export function MusicNotes({ isPlaying, noteColor }: MusicNotesProps) {
  const [notes, setNotes] = useState<Array<MusicNote>>([]);
  const noteIdRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setNotes([]);
      return;
    }

    const spawnNote = () => {
      const id = noteIdRef.current++;
      const angle = Math.random() * 360;

      const newNote: MusicNote = {
        angle,
        delay: Math.random() * 80, // Slight random delay for variation
        distance: 120 + Math.random() * 80, // Shorter: 120-200px
        duration: NOTE_LIFETIME_MS + Math.random() * 600,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: 0.85 + Math.random() * 0.35,
      };

      setNotes((prev) => [...prev, newNote].slice(-MAX_NOTES));

      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }, newNote.duration + newNote.delay);
    };

    // Spawn initial burst
    spawnNote();
    setTimeout(spawnNote, 60);
    setTimeout(spawnNote, 120);
    setTimeout(spawnNote, 180);

    const intervalId = setInterval(spawnNote, NOTE_SPAWN_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  const renderedNotes = useMemo(
    () =>
      notes.map((note) => {
        const IconComponent = MUSIC_ICONS[note.icon];
        if (!IconComponent) {
          return null;
        }
        return (
          <Box key={note.id} sx={getNoteSx(note, noteColor)}>
            <IconComponent size={15} />
          </Box>
        );
      }),
    [notes, noteColor],
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

/**
 * Client component that wraps album art with an organic bounce animation.
 * Uses GPU-accelerated transforms only.
 */
export function PlayingIndicator({ children, isPlaying }: PlayingIndicatorProps) {
  return <Box sx={getWrapperSx(isPlaying)}>{children}</Box>;
}
