import 'server-only';

import {
  type PeriodStatus,
  periodStatus,
  SITE_TIME_ZONE,
} from '@dg/shared-core/dates/periodStatus';

/** Hours in one of the day-and-shift matrix's shifts. */
export const SHIFT_HOURS = 6;

/** The latest play's Pacific day, hour, and timestamp: the edge between slots that happened and ones that haven't. */
export type StatsNow = { day: string; hour: number; timestamp: number };

const nowFormat = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  month: '2-digit',
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
});

export function statsNow(latestPlayedAt: Date): StatsNow {
  const parts = new Map(nowFormat.formatToParts(latestPlayedAt).map((p) => [p.type, p.value]));
  return {
    day: `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`,
    hour: Number(parts.get('hour')),
    timestamp: latestPlayedAt.getTime(),
  };
}

export function phaseOf(key: string, now: StatsNow): PeriodStatus {
  return periodStatus(key, now.timestamp, SITE_TIME_ZONE);
}

export function shiftPhase(dayIso: string, startHour: number, now: StatsNow): PeriodStatus {
  const dayPhase = phaseOf(dayIso, now);
  if (dayPhase !== 'current') return dayPhase;
  if (now.hour < startHour) return 'future';
  return now.hour < startHour + SHIFT_HOURS ? 'current' : 'past';
}
