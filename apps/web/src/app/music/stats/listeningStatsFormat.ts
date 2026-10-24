import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import type { StatsRange } from '@dg/shared-core/dates/statsRange';

const countFormat = new Intl.NumberFormat('en-US');
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});
const pacificDayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
});
const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});
const pacificMonthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
});

export function formatCount(value: number): string {
  return countFormat.format(Math.round(value));
}

export function formatHours(hours: number): string {
  if (hours > 0 && hours < 10) {
    return `${hours.toFixed(1)}h`;
  }
  return `${formatCount(hours)}h`;
}

export function formatPercent(part: number, whole: number, digits = 1): string {
  return `${whole > 0 ? ((part / whole) * 100).toFixed(digits) : (0).toFixed(digits)}%`;
}

/** `32,979` → `33.0k`, small counts unchanged. */
export function formatCompact(value: number): string {
  return value < 1000 ? String(value) : `${(value / 1000).toFixed(1)}k`;
}

/** A calendar day (`2017-05-29`) as `29 May 2017`. */
export function formatDay(day: string): string {
  return dayFormat.format(new Date(`${day}T12:00:00Z`));
}

/** A timestamp as the Pacific calendar day it fell on. */
export function formatPacificDay(timestamp: string): string {
  return pacificDayFormat.format(new Date(timestamp));
}

/** `2011-07` → `Jul 2011`. */
export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-15T12:00:00Z`));
}

/** A timestamp as the Pacific month it fell in, `Jul 2011`. */
export function formatPacificMonth(timestamp: string): string {
  return pacificMonthFormat.format(new Date(timestamp));
}

/** `2017` → `’17`. */
export function formatYearTick(year: number): string {
  return `\u2019${String(year).slice(-2)}`;
}

export function formatRangeSuffix(range: StatsRange): string {
  switch (range.kind) {
    case 'all':
      return 'all time';
    case 'week':
      return 'this week';
    case 'month':
      return 'this month';
    case 'year':
      return String(range.year);
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

export function formatPlaysHeading(range: StatsRange, firstPlayedAt: string): string {
  switch (range.kind) {
    case 'all':
      return `Plays since ${formatPacificMonth(firstPlayedAt)}`;
    case 'week':
      return 'Plays this week';
    case 'month':
      return 'Plays this month';
    case 'year':
      return `Plays in ${range.year}`;
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

export function formatStreakTotal(
  stats: Pick<ListeningStats, 'dayStreak' | 'monthStreak' | 'range'>,
): { label: string; sub: string; value: string } {
  if (stats.range.kind === 'all') {
    return {
      label: 'Months in a row',
      sub: `${formatMonth(stats.monthStreak.start)} to ${formatMonth(stats.monthStreak.end)}`,
      value: formatCount(stats.monthStreak.months),
    };
  }
  const { days, end, start } = stats.dayStreak;
  const sub =
    start && end
      ? start === end
        ? formatDay(start)
        : `${formatDay(start)} to ${formatDay(end)}`
      : 'Consecutive days';
  return {
    label: 'Days in a row',
    sub,
    value: formatCount(days),
  };
}

function hourOfDay(hour: number): string {
  const wrapped = ((hour % 24) + 24) % 24;
  return String(wrapped % 12 === 0 ? 12 : wrapped % 12);
}

function meridiem(hour: number): 'AM' | 'PM' {
  return ((hour % 24) + 24) % 24 < 12 ? 'AM' : 'PM';
}

/** `15, 2` → `3 to 5 PM`; spans across noon or midnight name both halves. */
export function formatHourRange(start: number, span: number): string {
  const end = start + span;
  const startMeridiem = meridiem(start);
  const endMeridiem = meridiem(end);
  return startMeridiem === endMeridiem
    ? `${hourOfDay(start)} to ${hourOfDay(end)} ${endMeridiem}`
    : `${hourOfDay(start)} ${startMeridiem} to ${hourOfDay(end)} ${endMeridiem}`;
}

/** The busiest `span` consecutive hours, wrapping past midnight. */
export function peakHours(hours: ReadonlyArray<number>, span: number) {
  let best = { plays: -1, start: 0 };
  hours.forEach((_, start) => {
    let plays = 0;
    for (let offset = 0; offset < span; offset++) {
      plays += hours[(start + offset) % hours.length] ?? 0;
    }
    if (plays > best.plays) {
      best = { plays, start };
    }
  });
  return { plays: Math.max(best.plays, 0), start: best.start };
}

/** `15` → `3 PM`, `0` → `12 AM`. */
export function formatHour(hour: number): string {
  return `${hourOfDay(hour)} ${meridiem(hour)}`;
}

/** `15` → `3p`, for dial ticks too tight for a full meridiem. */
export function formatHourTick(hour: number): string {
  return `${hourOfDay(hour)}${meridiem(hour) === 'AM' ? 'a' : 'p'}`;
}

const DAY_PART_HOURS = 6;

/** The day in four even parts, listed from the start of a waking day. */
export const DAY_PARTS = [
  { label: 'Morning', part: 'morning', startHour: 6 },
  { label: 'Afternoon', part: 'afternoon', startHour: 12 },
  { label: 'Evening', part: 'evening', startHour: 18 },
  { label: 'Late night', part: 'lateNight', startHour: 0 },
] as const;

export type DayPart = (typeof DAY_PARTS)[number]['part'];

/** `6 AM to 12 PM`, naming both ends so every part reads on its own. */
export function formatDayPartHours(startHour: number): string {
  return `${formatHour(startHour)} to ${formatHour(startHour + DAY_PART_HOURS)}`;
}

/** Which part of the day an hour belongs to. */
export function dayPartOf(hour: number): DayPart {
  const wrapped = ((hour % 24) + 24) % 24;
  const found = DAY_PARTS.find(
    ({ startHour }) => wrapped >= startHour && wrapped < startHour + DAY_PART_HOURS,
  );
  return found?.part ?? 'lateNight';
}

export function playsInDayPart(hours: ReadonlyArray<number>, part: DayPart): number {
  return hours.reduce((sum, plays, hour) => (dayPartOf(hour) === part ? sum + plays : sum), 0);
}
