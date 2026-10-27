import type { StatsMatrix } from '../fetchListeningStats';
import { buildRangeBreakdowns } from '../listeningStatsBreakdowns';
import { statsNow } from '../listeningStatsPhase';

function monthBreakdowns(
  month: string,
  latestPlayedAt: string,
  dailyPlays: ReadonlyArray<{ day: string; plays: number }> = [],
) {
  return buildRangeBreakdowns({
    bucketTopTracks: [],
    dailyPlays,
    dayHourPlays: [],
    month,
    monthlyPlays: [],
    now: statsNow(new Date(latestPlayedAt)),
    range: { kind: 'month' },
    tracks: new Map(),
    years: [],
  });
}

/** Each week as its days of the month, with blank placeholders as `''`. */
const calendar = (matrix: StatsMatrix) =>
  matrix.rows.map((row) => row.cells.map((cell) => (cell.blank ? '' : cell.key.slice(8))));

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(2, '0'));

describe('buildRangeBreakdowns for the calendar month', () => {
  it('lays a month that starts on a Monday into Monday-to-Sunday weeks', () => {
    // Noon Pacific, Thu 18 Jun 2026.
    const { matrix, timeline } = monthBreakdowns('2026-06', '2026-06-18T19:00:00Z');

    expect(matrix.title).toBe('Every day, this month');
    expect(matrix.columns.map((col) => col.full)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    expect(calendar(matrix)).toEqual([
      range(1, 7),
      range(8, 14),
      range(15, 21),
      range(22, 28),
      ['29', '30', '', '', '', '', ''],
    ]);
    expect(matrix.rows.map((row) => row.label)).toEqual([
      '1 Jun',
      '8 Jun',
      '15 Jun',
      '22 Jun',
      '29 Jun',
    ]);
    expect(timeline.points.map((point) => point.key)).toEqual(
      range(1, 30).map((day) => `2026-06-${day}`),
    );
  });

  it('pads a month that starts on a Sunday with blanks before the 1st and after its end', () => {
    const { matrix } = monthBreakdowns('2026-03', '2026-03-31T19:00:00Z');

    expect(calendar(matrix)).toEqual([
      ['', '', '', '', '', '', '01'],
      range(2, 8),
      range(9, 15),
      range(16, 22),
      range(23, 29),
      ['30', '31', '', '', '', '', ''],
    ]);
    expect(matrix.rows[0]?.key).toBe('2026-02-23');
    expect(matrix.rows[0]?.label).toBe('1 Mar');
    expect(
      matrix.rows.flatMap((row) => row.cells).filter((cell) => cell.blank && cell.label !== ''),
    ).toEqual([]);
  });

  it('ends February on its last day, in common and leap years', () => {
    const common = monthBreakdowns('2027-02', '2027-02-10T19:00:00Z');
    expect(calendar(common.matrix)).toEqual([
      range(1, 7),
      range(8, 14),
      range(15, 21),
      range(22, 28),
    ]);
    expect(common.timeline.points).toHaveLength(28);

    const leap = monthBreakdowns('2028-02', '2028-02-10T19:00:00Z');
    expect(calendar(leap.matrix)).toEqual([
      ['', ...range(1, 6)],
      range(7, 13),
      range(14, 20),
      range(21, 27),
      ['28', '29', '', '', '', '', ''],
    ]);
    expect(leap.timeline.points).toHaveLength(29);
  });

  it('keeps days after the latest play as future slots and today as current', () => {
    // 11 PM Pacific on Mon 26 Oct 2026.
    const { matrix } = monthBreakdowns('2026-10', '2026-10-27T06:00:00Z');
    const phases = new Map(
      matrix.rows.flatMap((row) => row.cells).map((cell) => [cell.key, cell.phase]),
    );

    expect(calendar(matrix)[0]).toEqual(['', '', '', '01', '02', '03', '04']);
    expect(phases.get('2026-10-25')).toBe('past');
    expect(phases.get('2026-10-26')).toBe('current');
    expect(phases.get('2026-10-27')).toBe('future');
    expect(phases.get('2026-10-31')).toBe('future');
  });

  it('scopes the peak and active days to the calendar month, ignoring plays in the blanks', () => {
    const { matrix, timeline } = monthBreakdowns('2026-03', '2026-03-31T19:00:00Z', [
      { day: '2026-02-28', plays: 99 },
      { day: '2026-03-10', plays: 5 },
      { day: '2026-03-11', plays: 3 },
      { day: '2026-04-01', plays: 50 },
    ]);
    const cells = matrix.rows.flatMap((row) => row.cells);

    expect(matrix.peakCell).toEqual({ key: '2026-03-10', label: 'Tue 10 Mar 2026', plays: 5 });
    expect(cells.filter((cell) => cell.plays > 0).map((cell) => cell.key)).toEqual([
      '2026-03-10',
      '2026-03-11',
    ]);
    expect(cells.filter((cell) => cell.blank).every((cell) => cell.plays === 0)).toBe(true);
    expect(timeline.points.reduce((sum, point) => sum + point.plays, 0)).toBe(8);
  });
});
