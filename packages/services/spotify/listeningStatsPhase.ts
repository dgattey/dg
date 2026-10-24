import 'server-only';

import type { StatsPhase } from './fetchListeningStats';
import { TIME_ZONE } from './listeningStatsQueries';

/** Hours in one of the day-and-shift matrix's shifts. */
export const SHIFT_HOURS = 6;

/** The latest play's Pacific day and hour: the edge between slots that happened and ones that haven't. */
export type StatsNow = { day: string; hour: number };

const nowFormat = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  month: '2-digit',
  timeZone: TIME_ZONE,
  year: 'numeric',
});

export function statsNow(latestPlayedAt: Date): StatsNow {
  const parts = new Map(nowFormat.formatToParts(latestPlayedAt).map((p) => [p.type, p.value]));
  return {
    day: `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`,
    hour: Number(parts.get('hour')),
  };
}

/** A `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` key against the latest play's day at the same precision. */
export function phaseOf(key: string, now: StatsNow): StatsPhase {
  const nowKey = now.day.slice(0, key.length);
  return key === nowKey ? 'current' : key > nowKey ? 'future' : 'past';
}

/** Days `start` through `end`, both `YYYY-MM-DD`. */
export function spanPhase(start: string, end: string, now: StatsNow): StatsPhase {
  return now.day < start ? 'future' : now.day <= end ? 'current' : 'past';
}

export function shiftPhase(dayIso: string, startHour: number, now: StatsNow): StatsPhase {
  const dayPhase = phaseOf(dayIso, now);
  if (dayPhase !== 'current') return dayPhase;
  if (now.hour < startHour) return 'future';
  return now.hour < startHour + SHIFT_HOURS ? 'current' : 'past';
}
