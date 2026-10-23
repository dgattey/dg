'use server';

import type { ListeningStats, StatsRangeKey } from '@dg/services/spotify/fetchListeningStats';
import { getListeningStats } from './musicStats';

export async function loadListeningStats(rangeKey: StatsRangeKey): Promise<ListeningStats | null> {
  return await getListeningStats(rangeKey);
}
