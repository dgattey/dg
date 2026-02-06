'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type NowPlayingAnimationProps = {
  /**
   * Whether the animation should be active
   */
  isPlaying: boolean;
  /**
   * Color for the music notes to match the album gradient
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

// Keyframe for floating and fading music notes - fades in, stays visible longer, then fades out
const floatAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(var(--note-scale)) rotate(0deg);
  }
  10% {
    opacity: 0.8;
    transform: translate(calc(-50% + var(--note-x) * 0.1), calc(-50% + var(--note-y) * 0.1)) scale(var(--note-scale)) rotate(calc(var(--note-rotation) * 0.1));
  }
  50% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--note-x)), calc(-50% + var(--note-y))) scale(calc(var(--note-scale) * 0.7)) rotate(var(--note-rotation));
  }
`;

// Container centered on the card, extends beyond for notes to travel
const containerSx: SxObject = {
  height: 0,
  left: '50%',
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 0,
  zIndex: 10, // Above the card content
};

const getNoteSx = (note: MusicNote, noteColor?: string): SxObject => ({
  '--note-rotation': `${note.angle > 180 ? -30 : 30}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * note.distance}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * note.distance}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  color: noteColor ?? 'rgba(255, 255, 255, 0.8)',
  left: 0,
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
});

/**
 * A component that shows music notes floating away from the card center.
 * Notes fade in, float outward in all directions, and fade out.
 */
export function NowPlayingAnimation({ isPlaying, noteColor }: NowPlayingAnimationProps) {
  const [notes, setNotes] = useState<Array<MusicNote>>([]);
  const noteIdRef = useRef(0);

  // Spawn notes at random intervals when playing
  useEffect(() => {
    if (!isPlaying) {
      setNotes([]);
      return;
    }

    const spawnNote = () => {
      const id = noteIdRef.current++;

      // Random angle for 360-degree emanation
      const angle = Math.random() * 360;

      const newNote: MusicNote = {
        angle,
        distance: 200 + Math.random() * 150, // Travel 200-350px outward
        duration: NOTE_LIFETIME_MS + Math.random() * 800,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: 0.9 + Math.random() * 0.4,
      };

      setNotes((prev) => {
        const updatedNotes = [...prev, newNote].slice(-MAX_NOTES);
        return updatedNotes;
      });

      // Remove note after animation completes
      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }, newNote.duration);
    };

    // Spawn a few notes immediately for visual impact
    spawnNote();
    setTimeout(spawnNote, 100);
    setTimeout(spawnNote, 200);

    // Spawn new notes at intervals
    const intervalId = setInterval(spawnNote, NOTE_SPAWN_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);

  // Memoize rendered notes to prevent unnecessary re-renders
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
    <Box aria-hidden="true" sx={containerSx}>
      {renderedNotes}
    </Box>
  );
}
