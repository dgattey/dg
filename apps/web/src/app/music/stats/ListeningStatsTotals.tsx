import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { ReactNode } from 'react';
import type { PaperTone } from '../../collage/types';
import { formatCount, formatMonth, formatPercent } from './listeningStatsFormat';
import { Scallop, Stub } from './StatsShapes';

export type TotalCut = { kind: 'seal' | 'stamp' | 'ticket'; tiltDeg: number; tone: PaperTone };

/** Each total gets its own paper: stubs, stamps, and seals at loose angles. */
export const TOTAL_CUTS = {
  activeDays: { kind: 'seal', tiltDeg: -6, tone: 'vermilion' },
  listeningTime: { kind: 'stamp', tiltDeg: 1.8, tone: 'cream' },
  months: { kind: 'ticket', tiltDeg: 1.5, tone: 'cobalt' },
  plays: { kind: 'ticket', tiltDeg: -2.5, tone: 'ochre' },
  shelf: { kind: 'seal', tiltDeg: 5, tone: 'viridian' },
  wholeAlbums: { kind: 'stamp', tiltDeg: -1.5, tone: 'rose' },
} as const satisfies Record<string, TotalCut>;

export function TotalPaper({ children, cut }: { children: ReactNode; cut: TotalCut }) {
  return cut.kind === 'seal' ? (
    <Scallop className="stats__total" tiltDeg={cut.tiltDeg} tone={cut.tone}>
      {children}
    </Scallop>
  ) : (
    <Stub className="stats__total" kind={cut.kind} tiltDeg={cut.tiltDeg} tone={cut.tone}>
      {children}
    </Stub>
  );
}

export function ListeningStatsTotals({ stats }: { stats: ListeningStats }) {
  const hours = (stats.plays * stats.minutesPerPlay) / 60;
  const totals = [
    {
      cut: TOTAL_CUTS.plays,
      label: 'Plays',
      sub: `${formatCount(stats.tracks)} tracks, ${formatCount(stats.artists)} artists`,
      value: formatCount(stats.plays),
    },
    {
      cut: TOTAL_CUTS.listeningTime,
      label: 'Listening time',
      sub: `Est. at ${stats.minutesPerPlay.toFixed(2)} min per play`,
      value: `${formatCount(hours)}h`,
    },
    {
      cut: TOTAL_CUTS.activeDays,
      label: 'Active days',
      sub: `${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)} days`,
      value: formatPercent(stats.activeDays, stats.spanDays),
    },
    {
      cut: TOTAL_CUTS.months,
      label: 'Months in a row',
      sub: `${formatMonth(stats.monthStreak.start)} to ${formatMonth(stats.monthStreak.end)}`,
      value: formatCount(stats.monthStreak.months),
    },
    {
      cut: TOTAL_CUTS.wholeAlbums,
      label: 'Whole albums',
      sub: `of plays, in ${formatCount(stats.sessions)} sessions`,
      value: formatPercent(stats.sessionPlays, stats.plays),
    },
    {
      cut: TOTAL_CUTS.shelf,
      label: 'From the shelf',
      sub: `${formatCount(stats.shelf.plays)} plays, ${formatCount(stats.shelf.albums)} albums`,
      value: formatPercent(stats.shelf.plays, stats.plays),
    },
  ];
  return (
    <ul aria-label="Totals" className="stats__totals">
      {totals.map(({ cut, label, sub, value }) => (
        <li key={label}>
          <TotalPaper cut={cut}>
            <span className="stats__meta">{label}</span>
            <span className="stats__number">{value}</span>
            <span className="stats__meta">{sub}</span>
          </TotalPaper>
        </li>
      ))}
    </ul>
  );
}
