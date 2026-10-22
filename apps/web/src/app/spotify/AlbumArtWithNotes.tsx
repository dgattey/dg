'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import type { ComponentProps, ReactNode } from 'react';
import { MusicNotes } from './MusicNotes';
import { useWaveformBounce } from './useWaveformBounce';

const SPOTIFY_ART_NOTES_Z_INDEX = 0;
const SPOTIFY_ART_ABOVE_NOTES_Z_INDEX = 2;

type AlbumArtWithNotesProps = {
  bounceIntensity?: number;
  children: ReactNode;
  isPlaying: boolean;
  noteColor?: string;
  notesVariant?: ComponentProps<typeof MusicNotes>['variant'];
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

export function AlbumArtWithNotes({
  bounceIntensity,
  children,
  isPlaying,
  noteColor,
  notesVariant = 'collage',
  wrapperSx,
}: AlbumArtWithNotesProps) {
  const bounceRef = useWaveformBounce<HTMLDivElement>({
    intensity: bounceIntensity,
    isPlaying,
  });

  return (
    <Box sx={{ overflow: 'visible', position: 'relative', ...wrapperSx }}>
      <Box aria-hidden="true" sx={notesLayerSx}>
        <MusicNotes isPlaying={isPlaying} noteColor={noteColor} variant={notesVariant} />
      </Box>
      <Box ref={bounceRef} sx={bounceWrapperSx}>
        {children}
      </Box>
    </Box>
  );
}
