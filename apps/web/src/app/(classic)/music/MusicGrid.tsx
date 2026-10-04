'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@mui/material';
import { AlbumPlayTile } from './AlbumPlayTile';
import { albumGridSx } from './albumTileGeometry';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';

type Props = {
  /** Collage only: the grid's first cover is the page's LCP image and loads eagerly. */
  hasLcpCandidate?: boolean;
  surface?: SiteSurface;
  tracks: Array<HistoryTrack>;
};

/**
 * Grid of music track thumbnails with responsive columns. Consecutive plays
 * from one album collapse into a single stacked cell.
 */
export function MusicGrid({ hasLcpCandidate = false, surface = 'classic', tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);

  if (surface === 'collage') {
    return (
      <div className="music__albumGrid">
        {runs.map((run, cardIndex) => {
          const [firstTrack] = run.tracks;
          return firstTrack ? (
            <AlbumPlayTile
              albumName={run.albumName}
              artistNames={run.artistNames}
              cardIndex={cardIndex}
              imageUrl={run.albumImageUrl}
              isLcpCandidate={hasLcpCandidate && cardIndex === 0}
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
