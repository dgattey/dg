import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import type { StatsRange } from '@dg/shared-core/dates/statsRange';

export type SqlPlayFilter = {
  /** SQL predicate over `{alias}."playedAt"` using only index-friendly timestamp bounds. */
  predicate: (alias?: string) => string;
};

export const ALL_TIME_FILTER: SqlPlayFilter = { predicate: () => '' };
const columnRef = (alias?: string): string => (alias ? `${alias}."playedAt"` : '"playedAt"');
export const whereClause = (filter: SqlPlayFilter, alias?: string): string => {
  const cond = filter.predicate(alias);
  return cond ? `WHERE ${cond}` : '';
};
export const andClause = (filter: SqlPlayFilter, alias?: string): string => {
  const cond = filter.predicate(alias);
  return cond ? `AND ${cond}` : '';
};

/** Plays from Pacific midnight on `startDay` up to, but not including, Pacific midnight on `endDay`. */
function localDaysPlayFilter(startDay: string, endDay: string): SqlPlayFilter {
  const bound = (day: string) => `('${day} 00:00:00'::timestamp AT TIME ZONE '${SITE_TIME_ZONE}')`;
  return {
    predicate: (alias) =>
      `${columnRef(alias)} >= ${bound(startDay)} AND ${columnRef(alias)} < ${bound(endDay)}`,
  };
}

export function yearPlayFilter(year: number): SqlPlayFilter {
  const safeYear = Math.trunc(year);
  return localDaysPlayFilter(`${safeYear}-01-01`, `${safeYear + 1}-01-01`);
}

/** Plays in one Pacific calendar month, `month` as `YYYY-MM`. */
export function monthPlayFilter(month: string): SqlPlayFilter {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  invariant(match, `Invalid calendar month: ${month}`);
  const year = Number(match[1]);
  const monthOfYear = Number(match[2]);
  const next =
    monthOfYear === 12 ? `${year + 1}-01` : `${year}-${String(monthOfYear + 1).padStart(2, '0')}`;
  return localDaysPlayFilter(`${month}-01`, `${next}-01`);
}

function rollingDaysPlayFilter(anchor: Date, days: number): SqlPlayFilter {
  const safeDays = Math.max(1, Math.trunc(days));
  const iso = anchor.toISOString();
  const startExpr = `((('${iso}'::timestamptz AT TIME ZONE '${SITE_TIME_ZONE}')::date - ${safeDays - 1})::timestamp AT TIME ZONE '${SITE_TIME_ZONE}')`;
  const endExpr = `'${iso}'::timestamptz`;
  return {
    predicate: (alias) =>
      `${columnRef(alias)} >= ${startExpr} AND ${columnRef(alias)} <= ${endExpr}`,
  };
}

/**
 * The plays a range covers: every play for all time, a Pacific calendar year or `month`
 * (`YYYY-MM`), or the seven Pacific days through the latest play.
 */
export function rangePlayFilter(
  range: StatsRange,
  latestPlayedAt: Date,
  month: string,
): SqlPlayFilter | undefined {
  switch (range.kind) {
    case 'all':
      return undefined;
    case 'year':
      return yearPlayFilter(range.year);
    case 'week':
      return rollingDaysPlayFilter(latestPlayedAt, 7);
    case 'month':
      return monthPlayFilter(month);
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}
