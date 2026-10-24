import { periodStatus } from '../periodStatus';

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
    expect(periodStatus('2026-10-24', NOW, 'America/Los_Angeles')).toBe('future');
    expect(periodStatus('2026-10-23-evening', NOW, 'America/Los_Angeles')).toBe('current');
  });

  it('treats keys that are not calendar buckets as past', () => {
    expect(periodStatus('morning', NOW)).toBe('past');
  });
});
