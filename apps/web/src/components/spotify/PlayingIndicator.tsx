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
};

const MUSIC_ICONS = [Music, Music2, Music3, Music4];
const NOTE_SPAWN_INTERVAL_MS = 400;
const NOTE_LIFETIME_MS = 3500;
const MAX_NOTES = 14;

// GPU-accelerated bounce using translate3d and scale3d
// Only animates transform (compositor-only, no layout/paint)
const albumBounce = keyframes`
  0%, 100% {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
  }
  25% {
    transform: scale3d(1.008, 1.008, 1) translate3d(0, -1px, 0);
  }
  50% {
    transform: scale3d(0.997, 0.997, 1) translate3d(0, 0.3px, 0);
  }
  75% {
    transform: scale3d(1.003, 1.003, 1) translate3d(0, -0.3px, 0);
  }
`;

// GPU-accelerated float animation using translate3d
// Only animates transform and opacity (compositor-only, no layout/paint)
const floatAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(0deg);
  }
  10% {
    opacity: 0.8;
    transform: translate3d(calc(-50% + var(--note-x) * 0.1), calc(-50% + var(--note-y) * 0.1), 0) scale3d(var(--note-scale), var(--note-scale), 1) rotate(calc(var(--note-rotation) * 0.1));
  }
  50% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translate3d(calc(-50% + var(--note-x)), calc(-50% + var(--note-y)), 0) scale3d(calc(var(--note-scale) * 0.7), calc(var(--note-scale) * 0.7), 1) rotate(var(--note-rotation));
  }
`;

const getWrapperSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${albumBounce} 0.6s ease-in-out infinite` : 'none',
  // GPU acceleration hints
  backfaceVisibility: 'hidden',
  position: 'relative',
  transform: 'translateZ(0)', // Force GPU layer when not animating
  willChange: isPlaying ? 'transform' : 'auto',
  zIndex: 2,
});

// Notes container - GPU accelerated
const notesContainerSx: SxObject = {
  backfaceVisibility: 'hidden',
  height: 0,
  left: '50%',
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translate3d(-50%, -50%, 0)',
  width: 0,
  zIndex: 1,
};

const getNoteSx = (note: MusicNote, noteColor?: string): SxObject => ({
  '--note-rotation': `${note.angle > 180 ? -30 : 30}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * note.distance}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * note.distance}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  // GPU acceleration hints
  backfaceVisibility: 'hidden',
  color: noteColor ?? 'rgba(255, 255, 255, 0.8)',
  left: 0,
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
        distance: 200 + Math.random() * 150,
        duration: NOTE_LIFETIME_MS + Math.random() * 800,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: 0.9 + Math.random() * 0.4,
      };

      setNotes((prev) => [...prev, newNote].slice(-MAX_NOTES));

      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }, newNote.duration);
    };

    spawnNote();
    setTimeout(spawnNote, 100);
    setTimeout(spawnNote, 200);

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
            <IconComponent size={16} />
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
 * Client component that wraps album art with a springy bounce animation.
 * Uses GPU-accelerated transforms only.
 */
export function PlayingIndicator({ children, isPlaying }: PlayingIndicatorProps) {
  return <Box sx={getWrapperSx(isPlaying)}>{children}</Box>;
}
