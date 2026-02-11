'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { MusicNotes } from './MusicNotes';
import { useWaveformBounce } from './useWaveformBounce';

/** z-index for notes (behind art) and art (above notes) — shared with card and header */
export const SPOTIFY_ART_NOTES_Z_INDEX = 0;
export const SPOTIFY_ART_ABOVE_NOTES_Z_INDEX = 2;

type AlbumArtWithNotesProps = {
  children: ReactNode;
  isPlaying: boolean;
  /** Override note color. Defaults to inherited text color. */
  noteColor?: string;
  notesVariant?: 'default' | 'compact';
  /** When false, notes and bounce are off (e.g. when off-screen). Default true. */
  shouldAnimate?: boolean;
  wrapperSx: SxObject;
};

const notesLayerSx: SxObject = {
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: SPOTIFY_ART_NOTES_Z_INDEX,
};

const bounceWrapperSx: SxObject = {
  backfaceVisibility: 'hidden',
  height: '100%',
  overflow: 'visible',
  position: 'relative',
  width: '100%',
  zIndex: SPOTIFY_ART_ABOVE_NOTES_Z_INDEX,
};

/**
 * Shared frame for Spotify album art: notes layer behind, bounce wrapper, then art.
 * Used by both the now-playing card and the header thumbnail.
 */
export function AlbumArtWithNotes({
  children,
  isPlaying,
  noteColor,
  notesVariant = 'default',
  shouldAnimate = true,
  wrapperSx,
}: AlbumArtWithNotesProps) {
  const animate = isPlaying && shouldAnimate;
  const bounceRef = useWaveformBounce<HTMLDivElement>({ isPlaying: animate });

  return (
    <Box sx={{ overflow: 'visible', position: 'relative', ...wrapperSx }}>
      <Box aria-hidden="true" sx={notesLayerSx}>
        <MusicNotes isPlaying={animate} noteColor={noteColor} variant={notesVariant} />
      </Box>
      <Box ref={bounceRef} sx={bounceWrapperSx}>
        {children}
      </Box>
    </Box>
  );
}
