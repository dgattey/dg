import 'server-only';

import type { StatsRange } from '@dg/shared-core/dates/statsRange';
import type { ListeningStats } from './fetchListeningStats';
import { type SqlPlayFilter, yearPlayFilter } from './listeningStatsFilters';
import type { StatsNow } from './listeningStatsPhase';
import { selectArtistFirstPlays } from './listeningStatsQueries';

/**
 * The window an artist's first play must fall in to count as new: the range's own
 * `rangeFilter`, or this year for all time, where every artist was new once.
 */
function newArtistWindow(range: StatsRange, rangeFilter: SqlPlayFilter, now: StatsNow) {
  const thisYear = Number(now.day.slice(0, 4));
  switch (range.kind) {
    case 'all':
      return { filter: yearPlayFilter(thisYear), label: 'New artist this year' };
    case 'year':
      return {
        filter: rangeFilter,
        label: range.year === thisYear ? 'New artist this year' : `New artist in ${range.year}`,
      };
    case 'week':
    case 'month':
      return { filter: rangeFilter, label: `New artist this ${range.kind}` };
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
  rangeFilter: SqlPlayFilter,
  now: StatsNow,
): Promise<ListeningStats['newArtists']> {
  const { filter, label } = newArtistWindow(range, rangeFilter, now);
  const firstPlays = await selectArtistFirstPlays([...artistIds], filter);
  return { ids: firstPlays.map((row) => row.artistId), label };
}
