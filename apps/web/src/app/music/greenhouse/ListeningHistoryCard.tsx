import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Typography } from '@mui/material';
import { MusicInfiniteScroll } from '../MusicInfiniteScroll';
import { greenhouseCardSx } from './greenhouseCardSx';

type Props = {
  initialTracks: ReadonlyArray<HistoryTrack>;
  initialCursor: string | null;
};

/**
 * Flag-on listening history. Same `getMusicHistory` page + infinite scroll as
 * flag-off, inside intro-token glass so date headers and tiles stay readable.
 */
export function ListeningHistoryCard({ initialTracks, initialCursor }: Props) {
  return (
    <ContentCard data-greenhouse-cell="history" data-listening-history="" sx={greenhouseCardSx}>
      {initialTracks.length === 0 ? (
        <Typography variant="body1">No listening history yet.</Typography>
      ) : (
        <MusicInfiniteScroll initialCursor={initialCursor} initialTracks={[...initialTracks]} />
      )}
    </ContentCard>
  );
}
