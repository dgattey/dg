'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@mui/material';
import { AlbumPlayTile } from './AlbumPlayTile';
import { albumGridSx } from './albumTileGeometry';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';
import albumStyles from './music.module.css';

type Props = {
  surface?: SiteSurface;
  tracks: Array<HistoryTrack>;
};

export function MusicGrid({ surface = 'classic', tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);

  if (surface === 'collage') {
    return (
      <div className={albumStyles.albumGrid}>
        {runs.map((run, cardIndex) => {
          const [firstTrack] = run.tracks;
          return firstTrack ? (
            <AlbumPlayTile
              albumName={run.albumName}
              artistNames={run.artistNames}
              cardIndex={cardIndex}
              imageUrl={run.albumImageUrl}
              key={run.key}
              linkUrl={run.tracks.length > 1 ? run.linkUrl : firstTrack.url}
              surface="collage"
              trackCount={run.tracks.length}
              trackName={firstTrack.trackName}
            />
          ) : null;
        })}
      </div>
    );
  }

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
