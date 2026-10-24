export type StatsRange =
  | { kind: 'all' }
  | { kind: 'month' }
  | { kind: 'week' }
  | { kind: 'year'; year: number };

export type StatsRangeKey = 'all' | 'month' | 'week' | `${number}`;

export function parseStatsRange(raw?: string | null): StatsRange {
  if (raw === 'week') return { kind: 'week' };
  if (raw === 'month') return { kind: 'month' };
  if (raw && /^(?:19|20)\d{2}$/.test(raw)) return { kind: 'year', year: Number(raw) };
  return { kind: 'all' };
}

export function statsRangeKey(range: StatsRange): StatsRangeKey {
  switch (range.kind) {
    case 'all':
      return 'all';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    case 'year':
      return `${range.year}`;
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

export function parseStatsRangeKey(raw?: string | null): StatsRangeKey {
  return statsRangeKey(parseStatsRange(raw));
}
