import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Typography } from '@mui/material';
import { MusicInfiniteScroll } from '../MusicInfiniteScroll';
import { greenhouseWellCardSx } from './greenhouseCardSx';

type Props = {
  initialTracks: ReadonlyArray<HistoryTrack>;
  initialCursor: string | null;
};

/**
 * Flag-on listening history. Same `getMusicHistory` page + infinite scroll as
 * flag-off, inside a column glass card. Date `StickyFadeBar` bands are
 * suppressed so they cannot run across the side foliage.
 */
export function ListeningHistoryCard({ initialTracks, initialCursor }: Props) {
  return (
    <ContentCard data-greenhouse-cell="history" data-listening-history="" sx={greenhouseWellCardSx}>
      <Typography component="h2" variant="h2">
        Listening history
      </Typography>
      {initialTracks.length === 0 ? (
        <Typography variant="body1">No listening history yet.</Typography>
      ) : (
        <MusicInfiniteScroll initialCursor={initialCursor} initialTracks={[...initialTracks]} />
      )}
    </ContentCard>
  );
}
