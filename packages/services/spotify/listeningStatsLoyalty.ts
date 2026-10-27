import 'server-only';

import type { StatsRange } from '@dg/shared-core/dates/statsRange';

/** Pacific days for a week or month, Pacific calendar months for a year or all time. */
export type StatsLoyaltyUnit = 'day' | 'month';

/** How many of the range's `possible` days or months had a play. */
export type StatsLoyalty = { active: number; possible: number; unit: StatsLoyaltyUnit };

export function loyaltyUnit(range: StatsRange): StatsLoyaltyUnit {
  switch (range.kind) {
    case 'week':
    case 'month':
      return 'day';
    case 'year':
    case 'all':
      return 'month';
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

/** `2026-10` as a running month count, so two months subtract to the months between them. */
export function monthIndex(month: string): number {
  const [year = 0, monthOfYear = 1] = month.split('-').map(Number);
  return year * 12 + monthOfYear - 1;
}

const monthsThrough = (first: number, last: number) => Math.max(0, last - first + 1);

/**
 * `possible` is the days or months the range has had so far: 7 for a week, the days of the
 * month through `today`, a year's months through `today`, or every month since the first play.
 */
export function buildLoyalty({
  activeMonthKeys,
  range,
  spanDays,
  summary,
  today,
}: {
  /** Pacific `YYYY-MM` months with a play in the range, oldest first. */
  activeMonthKeys: ReadonlyArray<string>;
  range: StatsRange;
  /** Days the week or month has had so far. */
  spanDays: number;
  summary: { activeDays: number };
  /** Pacific `YYYY-MM-DD`. */
  today: string;
}): StatsLoyalty {
  const { activeDays } = summary;
  const activeMonths = activeMonthKeys.length;
  const todayMonth = monthIndex(today.slice(0, 7));
  switch (range.kind) {
    case 'week':
    case 'month':
      return { active: activeDays, possible: Math.max(spanDays, activeDays), unit: 'day' };
    case 'year': {
      const last = Math.min(todayMonth, monthIndex(`${range.year}-12`));
      const possible = monthsThrough(monthIndex(`${range.year}-01`), last);
      return { active: activeMonths, possible: Math.max(possible, activeMonths), unit: 'month' };
    }
    case 'all': {
      const first = activeMonthKeys[0];
      const possible = monthsThrough(first ? monthIndex(first) : todayMonth, todayMonth);
      return { active: activeMonths, possible: Math.max(possible, activeMonths), unit: 'month' };
    }
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}
