import {
  DAY_PARTS,
  dayPartOf,
  formatCompact,
  formatDayPartHours,
  formatHour,
  formatHourRange,
  formatHours,
  formatHourTick,
  formatMonth,
  formatPercent,
  formatPlaysHeading,
  formatRangeSuffix,
  formatStatsRangeKey,
  formatStreakTotal,
  formatYearTick,
  peakHours,
  playsInDayPart,
} from '../listeningStatsFormat';

describe('formatCompact and formatHours', () => {
  it('keeps small counts and shortens thousands to one decimal', () => {
    expect(formatCompact(999)).toBe('999');
    expect(formatCompact(32_979)).toBe('33.0k');
    expect(formatHours(4.25)).toBe('4.3h');
    expect(formatHours(120.4)).toBe('120h');
  });
});

describe('formatPercent', () => {
  it('reads as zero when there is nothing to divide by', () => {
    expect(formatPercent(5, 0)).toBe('0.0%');
    expect(formatPercent(1, 3, 0)).toBe('33%');
  });
});

describe('range formatting', () => {
  it('formats range keys, suffixes, play headings, and streak labels', () => {
    expect(formatStatsRangeKey({ kind: 'all' })).toBe('all');
    expect(formatStatsRangeKey({ kind: 'week' })).toBe('week');
    expect(formatStatsRangeKey({ kind: 'month' })).toBe('month');
    expect(formatStatsRangeKey({ kind: 'year', year: 2024 })).toBe('2024');

    expect(formatRangeSuffix({ kind: 'all' })).toBe('all time');
    expect(formatRangeSuffix({ kind: 'week' })).toBe('this week');
    expect(formatRangeSuffix({ kind: 'month' })).toBe('this month');
    expect(formatRangeSuffix({ kind: 'year', year: 2024 })).toBe('2024');

    expect(formatPlaysHeading({ kind: 'all' }, '2011-07-29T19:00:00.000Z')).toBe(
      'Plays since Jul 2011',
    );
    expect(formatPlaysHeading({ kind: 'week' }, '2011-07-29T19:00:00.000Z')).toBe(
      'Plays this week',
    );
    expect(formatPlaysHeading({ kind: 'month' }, '2011-07-29T19:00:00.000Z')).toBe(
      'Plays this month',
    );
    expect(formatPlaysHeading({ kind: 'year', year: 2024 }, '2011-07-29T19:00:00.000Z')).toBe(
      'Plays in 2024',
    );

    expect(
      formatStreakTotal({
        dayStreak: { days: 5, end: '2024-03-05', start: '2024-03-01' },
        monthStreak: { end: '2024-03', months: 3, start: '2024-01' },
        range: { kind: 'all' },
      }),
    ).toEqual({
      label: 'Months in a row',
      sub: 'Jan 2024 to Mar 2024',
      value: '3',
    });

    expect(
      formatStreakTotal({
        dayStreak: { days: 5, end: '2024-03-05', start: '2024-03-01' },
        monthStreak: { end: '2024-03', months: 3, start: '2024-01' },
        range: { kind: 'year', year: 2024 },
      }),
    ).toEqual({
      label: 'Days in a row',
      sub: '1 Mar 2024 to 5 Mar 2024',
      value: '5',
    });
  });
});

describe('formatHourRange', () => {
  it('names one meridiem when the span stays on one side of noon', () => {
    expect(formatHourRange(15, 2)).toBe('3 to 5 PM');
  });

  it('names both halves across noon and midnight', () => {
    expect(formatHourRange(11, 2)).toBe('11 AM to 1 PM');
    expect(formatHourRange(23, 2)).toBe('11 PM to 1 AM');
  });
});

describe('peakHours', () => {
  it('finds the busiest run, wrapping past midnight', () => {
    const hours = Array.from({ length: 24 }, () => 1);
    hours[23] = 10;
    hours[0] = 10;

    expect(peakHours(hours, 2)).toEqual({ plays: 20, start: 23 });
  });
});

describe('formatHour', () => {
  it('reads midnight and noon as 12 on a 12-hour clock', () => {
    expect([0, 6, 12, 18].map(formatHour)).toEqual(['12 AM', '6 AM', '12 PM', '6 PM']);
    expect([0, 6, 12, 18].map(formatHourTick)).toEqual(['12a', '6a', '12p', '6p']);
  });
});

describe('dayPartOf', () => {
  it('splits the day into four six-hour parts on the 6s', () => {
    expect([6, 11, 12, 17, 18, 23, 0, 5].map(dayPartOf)).toEqual([
      'morning',
      'morning',
      'afternoon',
      'afternoon',
      'evening',
      'evening',
      'lateNight',
      'lateNight',
    ]);
  });

  it('labels each part with both ends of its hours', () => {
    expect(DAY_PARTS.map(({ startHour }) => formatDayPartHours(startHour))).toEqual([
      '6 AM to 12 PM',
      '12 PM to 6 PM',
      '6 PM to 12 AM',
      '12 AM to 6 AM',
    ]);
  });

  it('accounts for every play exactly once across the parts', () => {
    const hours = Array.from({ length: 24 }, (_, hour) => hour + 1);
    const total = DAY_PARTS.reduce((sum, { part }) => sum + playsInDayPart(hours, part), 0);

    expect(total).toBe(hours.reduce((sum, plays) => sum + plays, 0));
  });
});

describe('axis labels', () => {
  it('formats year ticks and month bounds', () => {
    expect(formatYearTick(2017)).toBe('\u201917');
    expect(formatMonth('2011-07')).toBe('Jul 2011');
  });
});
