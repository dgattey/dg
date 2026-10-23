import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ReactNode } from 'react';
import type { PaperTone } from '../../collage/types';
import {
  formatCount,
  formatHours,
  formatPercent,
  formatPlaysHeading,
  formatStreakTotal,
} from './listeningStatsFormat';
import { Scallop, Stub } from './StatsShapes';

export type TotalCut = { kind: 'seal' | 'stamp' | 'ticket'; tiltDeg: number; tone: PaperTone };

/** Each total gets its own paper: stubs, stamps, and seals at loose angles. */
export const TOTAL_CUTS = {
  activeDays: { kind: 'seal', tiltDeg: -6.2, tone: 'vermilion' },
  listeningTime: { kind: 'stamp', tiltDeg: 3.2, tone: 'cream' },
  months: { kind: 'ticket', tiltDeg: 2.4, tone: 'cobalt' },
  plays: { kind: 'ticket', tiltDeg: -2.2, tone: 'ochre' },
  shelf: { kind: 'seal', tiltDeg: 5.6, tone: 'viridian' },
  wholeAlbums: { kind: 'stamp', tiltDeg: -3.5, tone: 'rose' },
} as const satisfies Record<string, TotalCut>;

export type TotalSlotKey = keyof typeof TOTAL_CUTS;

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
  const streak = formatStreakTotal(stats);
  const totals: ReadonlyArray<{
    cut: TotalCut;
    href?: string;
    id: TotalSlotKey;
    label: string;
    sub: string;
    value: string;
  }> = [
    {
      cut: TOTAL_CUTS.plays,
      href: musicRoute,
      id: 'plays',
      label: formatPlaysHeading(stats.range, stats.firstPlayedAt),
      sub: `${formatCount(stats.tracks)} tracks, ${formatCount(stats.artists)} artists`,
      value: formatCount(stats.plays),
    },
    {
      cut: TOTAL_CUTS.listeningTime,
      id: 'listeningTime',
      label: 'Listening time',
      sub: `Est. at ${stats.minutesPerPlay.toFixed(2)} min per play`,
      value: formatHours(hours),
    },
    {
      cut: TOTAL_CUTS.activeDays,
      id: 'activeDays',
      label: 'Active days',
      sub: `${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)} days`,
      value: formatPercent(stats.activeDays, stats.spanDays),
    },
    {
      cut: TOTAL_CUTS.months,
      id: 'months',
      label: streak.label,
      sub: streak.sub,
      value: streak.value,
    },
    {
      cut: TOTAL_CUTS.wholeAlbums,
      id: 'wholeAlbums',
      label: 'Whole albums',
      sub: `of plays, in ${formatCount(stats.sessions)} sessions`,
      value: formatPercent(stats.sessionPlays, stats.plays),
    },
    {
      cut: TOTAL_CUTS.shelf,
      href: favoriteAlbumsRoute,
      id: 'shelf',
      label: 'From the shelf',
      sub: `${formatCount(stats.shelf.plays)} plays, ${formatCount(stats.shelf.albums)} albums`,
      value: formatPercent(stats.shelf.plays, stats.plays),
    },
  ];
  return (
    <ul aria-label="Totals" className="stats__totals">
      {totals.map(({ cut, href, id, label, sub, value }) => {
        const piece = (
          <TotalPaper cut={cut}>
            <span className="stats__meta stats__totalLabel">{label}</span>
            <span className="stats__number">{value}</span>
            <span className="stats__meta stats__totalSub">{sub}</span>
          </TotalPaper>
        );
        return (
          <li className={`stats__totalSlot stats__totalSlot--${id}`} key={id}>
            {href ? (
              <PageTransitionLink
                className="stats__totalLink collageLift"
                href={href}
                title={label}
              >
                {piece}
              </PageTransitionLink>
            ) : (
              piece
            )}
          </li>
        );
      })}
    </ul>
  );
}
