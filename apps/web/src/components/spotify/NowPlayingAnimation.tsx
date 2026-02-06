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
  x: number;
  y: number;
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
    transform: translate(0, 0) scale(var(--note-scale)) rotate(0deg);
  }
  10% {
    opacity: 0.7;
    transform: translate(calc(var(--note-x) * 0.05), calc(var(--note-y) * 0.05)) scale(var(--note-scale)) rotate(calc(var(--note-rotation) * 0.1));
  }
  40% {
    opacity: 0.6;
  }
  70% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translate(var(--note-x), var(--note-y)) scale(calc(var(--note-scale) * 0.7)) rotate(var(--note-rotation));
  }
`;

// Container positioned to allow notes to escape beyond the card - behind the card content
const containerSx: SxObject = {
  // Expand beyond the card boundaries
  bottom: -100,
  left: -100,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  right: -100,
  top: -100,
  zIndex: 0, // Behind the card content
};

const noteContainerSx: SxObject = {
  height: '100%',
  position: 'relative',
  width: '100%',
};

const getNoteSx = (note: MusicNote, noteColor?: string): SxObject => ({
  '--note-rotation': `${note.angle > 0 ? 25 : -25}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * note.distance}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * note.distance}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  color: noteColor ?? 'rgba(255, 255, 255, 0.7)',
  left: `${note.x}%`,
  position: 'absolute',
  top: `${note.y}%`,
  willChange: 'transform, opacity',
});

/**
 * A component that shows music notes floating away from the album art area.
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

      // Center around album art area (top-right of the card content)
      // With the expanded container (-100px on each side), we need to offset
      // Album art is roughly at 75% from left, 25% from top of original card
      // Adjusted for expanded container
      const albumCenterX = 68; // Percentage in expanded container
      const albumCenterY = 38; // Percentage in expanded container

      // Random angle for 360-degree emanation
      const angle = Math.random() * 360;

      // Spawn near the album art center with some randomness
      const spawnRadius = 2 + Math.random() * 6;
      const x = albumCenterX + Math.cos((angle * Math.PI) / 180) * spawnRadius;
      const y = albumCenterY + Math.sin((angle * Math.PI) / 180) * spawnRadius;

      const newNote: MusicNote = {
        angle,
        distance: 130 + Math.random() * 90, // Travel 130-220px outward
        duration: NOTE_LIFETIME_MS + Math.random() * 800,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: 0.7 + Math.random() * 0.5,
        x,
        y,
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
            <IconComponent size={14} />
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
      <Box sx={noteContainerSx}>{renderedNotes}</Box>
    </Box>
  );
}
