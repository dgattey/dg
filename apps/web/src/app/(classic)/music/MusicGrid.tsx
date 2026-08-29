'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@mui/material';
import { AlbumPlayTile } from './AlbumPlayTile';
import { albumGridSx } from './albumTileGeometry';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';
import styles from './MusicHistory.module.css';

type Props = {
  surface?: SiteSurface;
  tracks: Array<HistoryTrack>;
};

/**
 * Grid of music track thumbnails with responsive columns. Consecutive plays
 * from one album collapse into a single stacked cell.
 */
export function MusicGrid({ surface = 'classic', tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);
  const tiles = runs.map((run, cardIndex) => {
    const [firstTrack] = run.tracks;
    return firstTrack ? (
      <AlbumPlayTile
        albumName={run.albumName}
        artistNames={run.artistNames}
        cardIndex={cardIndex}
        imageUrl={run.albumImageUrl}
        key={run.key}
        linkUrl={run.tracks.length > 1 ? run.linkUrl : firstTrack.url}
        surface={surface}
        trackCount={run.tracks.length}
        trackName={firstTrack.trackName}
      />
    ) : null;
  });

  if (surface === 'collage') {
    return (
      <div className={styles.collageGrid} data-role="collage-music-grid">
        {tiles}
      </div>
    );
  }

  return <Box sx={albumGridSx}>{tiles}</Box>;
}
