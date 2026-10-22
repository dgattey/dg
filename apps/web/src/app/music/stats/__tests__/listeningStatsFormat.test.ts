import {
  DAY_PARTS,
  dayPartOf,
  formatCompact,
  formatDayPartHours,
  formatHour,
  formatHourRange,
  formatHourTick,
  formatMonth,
  formatPercent,
  formatYearTick,
  peakHours,
  playsInDayPart,
  weekdayExtremes,
  weekdayGroups,
} from '../listeningStatsFormat';

describe('formatCompact', () => {
  it('keeps small counts and shortens thousands to one decimal', () => {
    expect(formatCompact(999)).toBe('999');
    expect(formatCompact(32_979)).toBe('33.0k');
  });
});

describe('formatPercent', () => {
  it('reads as zero when there is nothing to divide by', () => {
    expect(formatPercent(5, 0)).toBe('0.0%');
    expect(formatPercent(1, 3, 0)).toBe('33%');
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

describe('weekdays', () => {
  const weekdays = [10, 20, 30, 40, 15, 5, 8];

  it('groups mid-week, the weekdays either side, and the weekend', () => {
    expect(weekdayGroups(weekdays)).toEqual([
      { label: 'Tue to Thu', plays: 90 },
      { label: 'Mon and Fri', plays: 25 },
      { label: 'Sat and Sun', plays: 13 },
    ]);
  });

  it('names the busiest and quietest days', () => {
    expect(weekdayExtremes(weekdays)).toEqual({
      busiest: { name: 'Thursday', plays: 40 },
      quietest: { name: 'Saturday', plays: 5 },
    });
  });
});

describe('axis labels', () => {
  it('formats year ticks and month bounds', () => {
    expect(formatYearTick(2017)).toBe('\u201917');
    expect(formatMonth('2011-07')).toBe('Jul 2011');
  });
});
