/** Where a calendar bucket sits relative to now: done, still filling in, or not started. */
export type PeriodStatus = 'past' | 'current' | 'future';

type CalendarDay = { day: number; month: number; year: number };

const PERIOD_KEY = /^(\d{4})(?:-(\d{2})(?:-(?:w([1-5])|(\d{2})))?)?/;
const WEEK_STARTS = [1, 8, 15, 22, 29] as const;

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Today's date in `timeZone`, so buckets roll over at local midnight. */
function calendarDay(now: number, timeZone: string): CalendarDay {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(now)).map(({ type, value }) => [type, Number(value)]),
  );
  return { day: parts.day ?? 1, month: parts.month ?? 1, year: parts.year ?? 1970 };
}

const compare = (a: number, b: number): PeriodStatus =>
  a < b ? 'past' : a > b ? 'future' : 'current';

/**
 * Classifies a bucket key (`2026`, `2026-10`, `2026-10-w3` for days 15–21, or
 * `2026-10-24`, with any trailing suffix ignored) against `now` in `timeZone`.
 * Keys that aren't calendar buckets count as past.
 */
export function periodStatus(key: string, now: number, timeZone = 'UTC'): PeriodStatus {
  const match = PERIOD_KEY.exec(key);
  if (!match) {
    return 'past';
  }
  const [, yearText, monthText, weekText, dayText] = match;
  const today = calendarDay(now, timeZone);
  const byYear = compare(Number(yearText), today.year);
  if (byYear !== 'current' || !monthText) {
    return byYear;
  }
  const byMonth = compare(Number(monthText), today.month);
  if (byMonth !== 'current') {
    return byMonth;
  }
  if (weekText) {
    const start = WEEK_STARTS[Number(weekText) - 1] ?? 1;
    const end = (WEEK_STARTS[Number(weekText)] ?? 32) - 1;
    return today.day < start ? 'future' : today.day > end ? 'past' : 'current';
  }
  return dayText ? compare(Number(dayText), today.day) : 'current';
}
