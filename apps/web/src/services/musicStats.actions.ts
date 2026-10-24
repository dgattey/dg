'use server';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { StatsRangeKey } from '@dg/shared-core/dates/statsRange';
import { getListeningStats } from './musicStats';

export async function loadListeningStats(rangeKey: StatsRangeKey): Promise<ListeningStats | null> {
  return await getListeningStats(rangeKey);
}
