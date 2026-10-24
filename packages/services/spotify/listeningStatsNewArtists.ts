import 'server-only';

import type { ListeningStats, StatsRange } from './fetchListeningStats';
import type { StatsNow } from './listeningStatsPhase';
import {
  rollingDaysPlayFilter,
  selectArtistFirstPlays,
  yearPlayFilter,
} from './listeningStatsQueries';

/**
 * The window an artist's first play must fall in to count as new: the range itself, or
 * this year for all time, where every artist was new once.
 */
function newArtistWindow(range: StatsRange, latestPlayedAt: Date, now: StatsNow) {
  const thisYear = Number(now.day.slice(0, 4));
  switch (range.kind) {
    case 'all':
      return { filter: yearPlayFilter(thisYear), label: 'New artist this year' };
    case 'year':
      return {
        filter: yearPlayFilter(range.year),
        label: range.year === thisYear ? 'New artist this year' : `New artist in ${range.year}`,
      };
    case 'week':
    case 'month':
      return {
        filter: rollingDaysPlayFilter(latestPlayedAt, range.kind === 'week' ? 7 : 30),
        label: `New artist this ${range.kind}`,
      };
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

/** Which of `artistIds` were first ever played inside the range's window, and how to say so. */
export async function findNewArtists(
  artistIds: Iterable<string>,
  range: StatsRange,
  latestPlayedAt: Date,
  now: StatsNow,
): Promise<ListeningStats['newArtists']> {
  const { filter, label } = newArtistWindow(range, latestPlayedAt, now);
  const firstPlays = await selectArtistFirstPlays([...artistIds], filter);
  return { ids: firstPlays.map((row) => row.artistId), label };
}
