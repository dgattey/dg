'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { AlbumThumbnail } from '../spotify/AlbumThumbnail';
import { AlbumStack } from './AlbumStack';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';

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
 * Grid of music track thumbnails with responsive columns. Consecutive plays
 * from one album collapse into a single stacked cell.
 */
export function MusicGrid({ tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);

  return (
    <Box sx={gridSx}>
      {runs.map((run) => {
        if (run.tracks.length > 1) {
          return (
            <AlbumStack
              albumName={run.albumName}
              artistNames={run.artistNames}
              imageUrl={run.albumImageUrl}
              key={run.key}
              linkUrl={run.linkUrl}
              trackCount={run.tracks.length}
            />
          );
        }
        const [track] = run.tracks;
        return track ? (
          <AlbumThumbnail
            albumName={track.albumName}
            imageUrl={track.albumImageUrl}
            key={run.key}
            linkUrl={track.url}
            tooltip={`${track.trackName} – ${track.artistNames}`}
          />
        ) : null;
      })}
    </Box>
  );
}
