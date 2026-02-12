'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { HistoryTrack } from '../../services/music';
import { AlbumThumbnail } from '../spotify/AlbumThumbnail';

type Props = {
  tracks: Array<HistoryTrack>;
};

const gridSx: SxObject = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: 'repeat(6, 1fr)',
    md: 'repeat(4, 1fr)',
    sm: 'repeat(3, 1fr)',
    xs: 'repeat(2, 1fr)',
  },
};

/**
 * Grid of music track thumbnails with responsive columns.
 */
export function MusicGrid({ tracks }: Props) {
  return (
    <Box sx={gridSx}>
      {tracks.map((track) => (
        <AlbumThumbnail
          albumName={track.albumName}
          imageUrl={track.albumImageUrl}
          key={`${track.playedAt}-${track.trackId}`}
          linkUrl={track.url}
          tooltip={`${track.trackName} – ${track.artistNames}`}
        />
      ))}
    </Box>
  );
}
