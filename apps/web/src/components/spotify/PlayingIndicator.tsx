'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  /**
   * Whether the gradient background is dark (affects shadow for contrast)
   */
  isDark?: boolean;
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

const wrapperBaseSx: SxObject = {
  backfaceVisibility: 'hidden',
  position: 'relative',
  zIndex: 2,
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

const getNoteSx = (note: MusicNote, noteColor?: string, isDark?: boolean): SxObject => ({
  '--note-rotation': `${note.angle > 180 ? -25 : 25}deg`,
  '--note-scale': note.scale,
  '--note-x': `${Math.cos((note.angle * Math.PI) / 180) * note.distance}px`,
  '--note-y': `${Math.sin((note.angle * Math.PI) / 180) * note.distance}px`,
  animation: `${floatAndFade} ${note.duration}ms ease-out forwards`,
  animationDelay: `${note.delay}ms`,
  backfaceVisibility: 'hidden',
  color: noteColor ?? 'rgba(128, 128, 128, 0.8)',
  filter: isDark
    ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
    : 'drop-shadow(0 1px 3px rgba(255, 255, 255, 0.8))',
  left: 0,
  opacity: 0,
  position: 'absolute',
  top: 0,
  willChange: 'transform, opacity',
});

/**
 * Music notes that emanate from a center point.
 */
export function MusicNotes({ isPlaying, noteColor, isDark }: MusicNotesProps) {
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
        delay: Math.random() * 80,
        distance: 120 + Math.random() * 80,
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
          <Box key={note.id} sx={getNoteSx(note, noteColor, isDark)}>
            <IconComponent size={15} />
          </Box>
        );
      }),
    [notes, noteColor, isDark],
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
 * Client component that wraps album art with a waveform-simulated bounce.
 * Uses requestAnimationFrame for organic, music-like movement with randomness.
 */
export function PlayingIndicator({ children, isPlaying }: PlayingIndicatorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const simulateWaveform = useCallback(() => {
    if (!wrapperRef.current) {
      return;
    }

    const time = timeRef.current;

    // Base pulse - slow sine wave for breathing effect
    const basePulse = Math.sin(time) * 0.012;

    // Secondary rhythm - faster oscillation for groove
    const rhythm = Math.sin(time * 1.7) * 0.006;

    // Micro-jitters for realism (simulating highs/mids)
    const jitter = (Math.random() - 0.5) * 0.004;

    // Occasional "beat" - sharp bump when sine crosses threshold
    const beatTrigger = Math.sin(time * 0.6);
    const beat = beatTrigger > 0.92 ? 0.018 * (beatTrigger - 0.92) * 12.5 : 0;

    // Subtle vertical movement synced with scale
    const yOffset = (basePulse + rhythm) * -15; // Negative = up when scaling up

    // Combine into final transform
    const finalScale = 1 + basePulse + rhythm + jitter + beat;

    wrapperRef.current.style.transform = `scale3d(${finalScale}, ${finalScale}, 1) translate3d(0, ${yOffset}px, 0)`;

    // Advance time - controls tempo feel
    timeRef.current += 0.08;

    rafRef.current = requestAnimationFrame(simulateWaveform);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timeRef.current = 0;
      simulateWaveform();
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Reset transform when stopped
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'scale3d(1, 1, 1) translate3d(0, 0, 0)';
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, simulateWaveform]);

  return (
    <Box ref={wrapperRef} sx={wrapperBaseSx}>
      {children}
    </Box>
  );
}
