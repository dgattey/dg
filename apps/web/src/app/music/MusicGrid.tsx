'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { Box } from '@mui/material';
import { AlbumPlayTile } from './AlbumPlayTile';
import { albumGridSx } from './albumTileGeometry';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';

type Props = {
  tracks: Array<HistoryTrack>;
};

/**
 * Grid of music track thumbnails with responsive columns. Consecutive plays
 * from one album collapse into a single stacked cell.
 */
export function MusicGrid({ tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);

  return (
    <Box sx={albumGridSx}>
      {runs.map((run) => {
        const [firstTrack] = run.tracks;
        return firstTrack ? (
          <AlbumPlayTile
            albumName={run.albumName}
            artistNames={run.artistNames}
            imageUrl={run.albumImageUrl}
            key={run.key}
            linkUrl={run.tracks.length > 1 ? run.linkUrl : firstTrack.url}
            trackCount={run.tracks.length}
            trackName={firstTrack.trackName}
          />
        ) : null;
      })}
    </Box>
  );
}
