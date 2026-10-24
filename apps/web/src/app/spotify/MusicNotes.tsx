'use client';

import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

type MusicNotesProps = {
  isPlaying: boolean;
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
const NOTE_SPAWN_INTERVAL_MS = 280;

const COLLAGE_NOTES_CONFIG = {
  delayMaxMs: 80,
  distanceMin: 190,
  distanceRange: 80,
  durationMs: 3000,
  durationRandomMs: 600,
  iconSize: 22,
  maxNotes: 18,
  scaleMin: 0.95,
  scaleRange: 0.4,
  startDistance: 110,
  strokeWidth: 2.5,
};

function getNoteVars(note: MusicNote, noteColor?: string): CSSProperties {
  const x = Math.cos((note.angle * Math.PI) / 180);
  const y = Math.sin((note.angle * Math.PI) / 180);
  return {
    '--note-color': noteColor ?? 'currentColor',
    '--note-delay': `${note.delay}ms`,
    '--note-duration': `${note.duration}ms`,
    '--note-rotation': `${note.angle > 180 ? -25 : 25}deg`,
    '--note-scale': note.scale,
    '--note-x': `${x * note.distance}px`,
    '--note-x0': `${x * COLLAGE_NOTES_CONFIG.startDistance}px`,
    '--note-y': `${y * note.distance}px`,
    '--note-y0': `${y * COLLAGE_NOTES_CONFIG.startDistance}px`,
  } as CSSProperties;
}

export function MusicNotes({ isPlaying, noteColor }: MusicNotesProps) {
  const [notes, setNotes] = useState<Array<MusicNote>>([]);
  const noteIdRef = useRef(0);

  useEffect(() => {
    if (!isPlaying || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setNotes([]);
      return;
    }

    const timeoutIds = new Set<number>();

    const spawnNote = () => {
      const id = noteIdRef.current++;
      const newNote: MusicNote = {
        angle: Math.random() * 360,
        delay: Math.random() * COLLAGE_NOTES_CONFIG.delayMaxMs,
        distance:
          COLLAGE_NOTES_CONFIG.distanceMin + Math.random() * COLLAGE_NOTES_CONFIG.distanceRange,
        duration:
          COLLAGE_NOTES_CONFIG.durationMs + Math.random() * COLLAGE_NOTES_CONFIG.durationRandomMs,
        icon: Math.floor(Math.random() * MUSIC_ICONS.length),
        id,
        scale: COLLAGE_NOTES_CONFIG.scaleMin + Math.random() * COLLAGE_NOTES_CONFIG.scaleRange,
      };

      setNotes((prev) => [...prev, newNote].slice(-COLLAGE_NOTES_CONFIG.maxNotes));

      const cleanupId = window.setTimeout(() => {
        timeoutIds.delete(cleanupId);
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }, newNote.duration + newNote.delay);
      timeoutIds.add(cleanupId);
    };

    spawnNote();
    for (const initialDelay of [60, 120, 180]) {
      const initId = window.setTimeout(() => {
        timeoutIds.delete(initId);
        spawnNote();
      }, initialDelay);
      timeoutIds.add(initId);
    }

    const intervalId = window.setInterval(spawnNote, NOTE_SPAWN_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
      for (const tid of timeoutIds) {
        window.clearTimeout(tid);
      }
    };
  }, [isPlaying]);

  if (!isPlaying) {
    return null;
  }

  return (
    <div aria-hidden="true" data-ambient-notes="true">
      {notes.map((note) => {
        const IconComponent = MUSIC_ICONS[note.icon];
        if (!IconComponent) {
          return null;
        }
        return (
          <div data-music-note="" key={note.id} style={getNoteVars(note, noteColor)}>
            <IconComponent
              size={COLLAGE_NOTES_CONFIG.iconSize}
              strokeWidth={COLLAGE_NOTES_CONFIG.strokeWidth}
            />
          </div>
        );
      })}
    </div>
  );
}
