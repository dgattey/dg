import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { AlbumPlayTile } from './AlbumPlayTile';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';

type Props = {
  /** The grid's first cover is the page's LCP image and loads eagerly. */
  hasLcpCandidate?: boolean;
  tracks: Array<HistoryTrack>;
};

/**
 * Grid of music track thumbnails with responsive columns. Consecutive plays
 * from one album collapse into a single stacked cell.
 */
export function MusicGrid({ hasLcpCandidate = false, tracks }: Props) {
  const runs = groupAdjacentAlbumPlays(tracks);

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
            trackCount={run.tracks.length}
            trackName={firstTrack.trackName}
          />
        ) : null;
      })}
    </div>
  );
}
