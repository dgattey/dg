const TIME_ZONE = 'America/Los_Angeles';

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
  timeZone: TIME_ZONE,
  year: 'numeric',
});
const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function formatCount(value: number): string {
  return countFormat.format(Math.round(value));
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

/** `2017` → `’17`. */
export function formatYearTick(year: number): string {
  return `\u2019${String(year).slice(-2)}`;
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

export type HourShift = 'desk' | 'evening' | 'rest' | 'night';

/** Which part of the listening day an hour belongs to. */
export function hourShift(hour: number): HourShift {
  if (hour >= 13 && hour <= 18) {
    return 'desk';
  }
  if (hour >= 19 || hour === 0) {
    return 'evening';
  }
  if (hour >= 3 && hour <= 6) {
    return 'night';
  }
  return 'rest';
}

export const HOUR_SHIFTS: ReadonlyArray<{ label: string; shift: HourShift }> = [
  { label: 'Desk, 13:00 to 18:59', shift: 'desk' },
  { label: 'Evening, 19:00 to 00:59', shift: 'evening' },
  { label: 'Mornings and 01:00 to 02:59', shift: 'rest' },
  { label: 'Dead of night, 03:00 to 06:59', shift: 'night' },
];

export function playsInShift(hours: ReadonlyArray<number>, shift: HourShift): number {
  return hours.reduce((sum, plays, hour) => (hourShift(hour) === shift ? sum + plays : sum), 0);
}

export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Which `weekdayGroups` entry each Monday-first day falls in. */
export const WEEKDAY_GROUP_OF_DAY: ReadonlyArray<number> = [1, 0, 0, 0, 1, 2, 2];

/** Mid-week, the weekdays either side, and the weekend, from Monday-first counts. */
export function weekdayGroups(weekdays: ReadonlyArray<number>) {
  const sum = (...days: Array<number>) =>
    days.reduce((total, day) => total + (weekdays[day] ?? 0), 0);
  return [
    { label: 'Tue to Thu', plays: sum(1, 2, 3) },
    { label: 'Mon and Fri', plays: sum(0, 4) },
    { label: 'Sat and Sun', plays: sum(5, 6) },
  ];
}

/** The single busiest and quietest weekdays, Monday-first counts. */
export function weekdayExtremes(weekdays: ReadonlyArray<number>) {
  const days = WEEKDAY_NAMES.map((name, i) => ({ name, plays: weekdays[i] ?? 0 }));
  const sorted = [...days].sort((a, b) => b.plays - a.plays);
  const fallback = { name: WEEKDAY_NAMES[0], plays: 0 };
  return { busiest: sorted[0] ?? fallback, quietest: sorted[sorted.length - 1] ?? fallback };
}
