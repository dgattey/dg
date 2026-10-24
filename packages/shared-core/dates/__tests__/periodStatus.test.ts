import { periodStatus, SITE_TIME_ZONE } from '../periodStatus';
import { parseStatsRange, parseStatsRangeKey, statsRangeKey } from '../statsRange';

// Sat Oct 24 2026, 06:00 UTC, which is still Fri Oct 23 in Los Angeles.
const NOW = Date.parse('2026-10-24T06:00:00Z');

describe('periodStatus', () => {
  it('compares years', () => {
    expect(periodStatus('2025', NOW)).toBe('past');
    expect(periodStatus('2026', NOW)).toBe('current');
    expect(periodStatus('2027', NOW)).toBe('future');
  });

  it('compares months within the year', () => {
    expect(periodStatus('2026-09', NOW)).toBe('past');
    expect(periodStatus('2026-10', NOW)).toBe('current');
    expect(periodStatus('2026-11', NOW)).toBe('future');
    expect(periodStatus('2025-12', NOW)).toBe('past');
  });

  it('places week-of-month buckets by their day ranges', () => {
    expect(periodStatus('2026-10-w3', NOW)).toBe('past');
    expect(periodStatus('2026-10-w4', NOW)).toBe('current');
    expect(periodStatus('2026-10-w5', NOW)).toBe('future');
  });

  it('rolls days over at local midnight', () => {
    expect(periodStatus('2026-10-24', NOW)).toBe('current');
    expect(periodStatus('2026-10-24', NOW, SITE_TIME_ZONE)).toBe('future');
    expect(periodStatus('2026-10-23-evening', NOW, SITE_TIME_ZONE)).toBe('current');
  });

  it('treats keys that are not calendar buckets as past', () => {
    expect(periodStatus('morning', NOW)).toBe('past');
  });
});

describe('statsRange', () => {
  it('parses and formats range keys consistently', () => {
    expect(parseStatsRange(undefined)).toEqual({ kind: 'all' });
    expect(parseStatsRange('all')).toEqual({ kind: 'all' });
    expect(parseStatsRange('week')).toEqual({ kind: 'week' });
    expect(parseStatsRange('month')).toEqual({ kind: 'month' });
    expect(parseStatsRange('2024')).toEqual({ kind: 'year', year: 2024 });
    expect(parseStatsRange('invalid')).toEqual({ kind: 'all' });

    expect(statsRangeKey({ kind: 'all' })).toBe('all');
    expect(statsRangeKey({ kind: 'week' })).toBe('week');
    expect(statsRangeKey({ kind: 'month' })).toBe('month');
    expect(statsRangeKey({ kind: 'year', year: 2024 })).toBe('2024');

    expect(parseStatsRangeKey('2024')).toBe('2024');
    expect(parseStatsRangeKey('bogus')).toBe('all');
  });
});
