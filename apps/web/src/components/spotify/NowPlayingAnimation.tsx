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
};

const MUSIC_ICONS = [Music, Music2, Music3, Music4];
const NOTE_SPAWN_INTERVAL_MS = 800;
const NOTE_LIFETIME_MS = 2000;
const MAX_NOTES = 8;

// Keyframe for floating and fading music notes
const floatAndFade = keyframes`
  0% {
    opacity: 0.7;
    transform: translate(0, 0) scale(var(--note-scale)) rotate(0deg);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translate(var(--note-x), var(--note-y)) scale(calc(var(--note-scale) * 0.5)) rotate(var(--note-rotation));
  }
`;

// Subtle bounce keyframe for the container
const subtleBounce = keyframes`
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.008) translateY(-1px);
  }
`;

const containerSx: SxObject = {
  inset: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 2,
};

const getBouncingSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${subtleBounce} 1.5s ease-in-out infinite` : 'none',
  height: '100%',
  position: 'relative',
  width: '100%',
});

const getNoteSx = (note: MusicNote, noteColor?: string): SxObject => ({
  '--note-rotation': `${note.angle > 180 ? -15 : 15}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * 60}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * 60}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  color: noteColor ?? 'rgba(255, 255, 255, 0.7)',
  left: `${note.x}%`,
  position: 'absolute',
  top: `${note.y}%`,
  willChange: 'transform, opacity',
});

/**
 * A component that shows subtle playing animation:
 * - Gentle bounce on the card when playing
 * - Music notes floating away from random positions
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
      // Random position along the edges and corners
      const side = Math.random();
      let x: number;
      let y: number;

      if (side < 0.25) {
        // Top edge
        x = Math.random() * 100;
        y = Math.random() * 20;
      } else if (side < 0.5) {
        // Right edge
        x = 80 + Math.random() * 20;
        y = Math.random() * 100;
      } else if (side < 0.75) {
        // Bottom edge
        x = Math.random() * 100;
        y = 80 + Math.random() * 20;
      } else {
        // Left edge
        x = Math.random() * 20;
        y = Math.random() * 100;
      }

      // Calculate outward angle from center
      const centerX = 50;
      const centerY = 50;
      const angle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;

      const newNote: MusicNote = {
        angle,
        duration: NOTE_LIFETIME_MS + Math.random() * 500,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: 0.8 + Math.random() * 0.4,
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

    // Initial spawn
    spawnNote();

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
    <Box sx={containerSx}>
      <Box sx={getBouncingSx(isPlaying)}>{renderedNotes}</Box>
    </Box>
  );
}
