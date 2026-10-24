'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
import {
  DAY_PARTS,
  type DayPart,
  dayPartOf,
  formatCompact,
  formatCount,
  formatDayPartHours,
  formatHour,
  formatHourRange,
  formatHours,
  formatHourTick,
  formatPercent,
  peakHours,
  playsInDayPart,
} from './listeningStatsFormat';
import { CardHead } from './StatsCardParts';

const INNER = 58;
const REACH = 92;
const HALF_SPAN_DEG = 6.4;
const TICK_HOURS = DAY_PARTS.map(({ startHour }) => startHour);

function point(radius: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return {
    x: Number((radius * Math.cos(rad)).toFixed(2)),
    y: Number((radius * Math.sin(rad)).toFixed(2)),
  };
}

function polar(radius: number, deg: number): string {
  const { x, y } = point(radius, deg);
  return `${x} ${y}`;
}

/** Midnight at the top, clockwise, like a clock face. */
function hourAngle(hour: number): number {
  return hour * 15 - 90;
}

function wedgePath(hour: number, outer: number): string {
  const a0 = hourAngle(hour) - HALF_SPAN_DEG;
  const a1 = hourAngle(hour) + HALF_SPAN_DEG;
  return [
    `M ${polar(INNER, a0)}`,
    `L ${polar(outer, a0)}`,
    `A ${outer} ${outer} 0 0 1 ${polar(outer, a1)}`,
    `L ${polar(INNER, a1)}`,
    `A ${INNER} ${INNER} 0 0 0 ${polar(INNER, a0)}`,
    'Z',
  ].join(' ');
}

type HourPlays = { hour: number; plays: number };

function Turntable({
  byHour,
  hoveredHour,
  hoveredPart,
  onHoverHour,
  peakStart,
}: {
  byHour: ReadonlyArray<HourPlays>;
  hoveredHour: number | null;
  hoveredPart: DayPart | null;
  onHoverHour: (hour: number | null) => void;
  peakStart: number;
}) {
  const max = Math.max(...byHour.map(({ plays }) => plays), 1);
  const isPeak = (hour: number) => (hour - peakStart + 24) % 24 < 2;
  const busiest = byHour.find(({ plays }) => plays === max);
  const activeWedge =
    hoveredHour !== null ? byHour.find(({ hour }) => hour === hoveredHour) : busiest;
  const outer = (plays: number) => INNER + Math.max(4, (REACH * plays) / max);
  const engaged = hoveredHour !== null || hoveredPart !== null;

  return (
    <svg
      aria-hidden="true"
      className="stats__clock"
      onPointerLeave={() => onHoverHour(null)}
      onPointerOver={(event) => {
        const target = (event.target as Element | null)?.closest?.('[data-hour]');
        const attr = target?.getAttribute('data-hour');
        onHoverHour(attr !== null && attr !== undefined ? Number(attr) : null);
      }}
      viewBox="-172 -172 344 344"
    >
      <circle className="stats__clockGuide" r={INNER + REACH} />
      <circle className="stats__clockGuide" r={INNER + REACH / 2} />
      {byHour.map(({ hour, plays }) => {
        const part = dayPartOf(hour);
        const isActive = hoveredHour === hour || (hoveredHour === null && hoveredPart === part);
        return (
          <path
            className={cx(
              'stats__wedge',
              `stats__shift--${part}`,
              isPeak(hour) && 'stats__wedge--peak',
              isActive && 'stats__wedge--active',
              engaged && !isActive && 'stats__wedge--dim',
            )}
            d={wedgePath(hour, outer(plays))}
            data-hour={hour}
            key={hour}
          />
        );
      })}
      {TICK_HOURS.map((hour) => {
        const { x, y } = point(INNER + REACH + 14, hourAngle(hour));
        return (
          <text className="stats__clockTick" key={hour} x={x} y={y}>
            {formatHourTick(hour)}
          </text>
        );
      })}
      <circle className="stats__vinylDisc" r={INNER - 8} />
      {[44, 38, 32].map((r) => (
        <circle className="stats__vinylGroove" key={r} r={r} />
      ))}
      <circle className="stats__vinylLabel" r={18} />
      <circle className="stats__vinylHole" r={3.5} />
      {activeWedge ? (
        <text
          className="stats__clockValue"
          {...point(outer(activeWedge.plays) + 18, hourAngle(activeWedge.hour))}
        >
          {formatCompact(activeWedge.plays)}
        </text>
      ) : null}
    </svg>
  );
}

/** Plays by hour as petals around a record, with the share of each part of the day. */
export function ListeningClock({ stats }: { stats: ListeningStats }) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [hoveredPart, setHoveredPart] = useState<DayPart | null>(null);
  const peak = peakHours(stats.hours, 2);
  const byHour = stats.hours.map((plays, hour) => ({ hour, plays }));
  const hoveredHourPlays = hoveredHour !== null ? (stats.hours[hoveredHour] ?? 0) : null;
  const activePartMeta =
    hoveredPart !== null ? DAY_PARTS.find((item) => item.part === hoveredPart) : undefined;
  const activePartPlays = hoveredPart !== null ? playsInDayPart(stats.hours, hoveredPart) : null;

  return (
    <PaperCard
      className="stats__card stats__day"
      edge="soft-a"
      innerClassName="stats__pad"
      tag={
        <PaperTag className="stats__pin" tiltDeg={6} tone="vermilion">
          Peak {formatHourTick(peak.start)}–{formatHourTick(peak.start + 2)}
        </PaperTag>
      }
      tiltDeg={-0.8}
    >
      <CardHead
        aside={
          hoveredHour !== null && hoveredHourPlays !== null ? (
            <span className="stats__clockReadout">
              <strong>{formatHourRange(hoveredHour, 1)}</strong>: {formatCount(hoveredHourPlays)}{' '}
              plays · {formatHours((hoveredHourPlays * stats.minutesPerPlay) / 60)} (
              {formatPercent(hoveredHourPlays, stats.plays)})
            </span>
          ) : activePartMeta && activePartPlays !== null ? (
            <span className="stats__clockReadout">
              <strong>{activePartMeta.label}</strong>: {formatCount(activePartPlays)} plays ·{' '}
              {formatHours((activePartPlays * stats.minutesPerPlay) / 60)} (
              {formatPercent(activePartPlays, stats.plays)})
            </span>
          ) : (
            `${formatPercent(peak.plays, stats.plays)} of plays land in those two hours`
          )
        }
        title="A day of listening, Pacific time"
      />
      <div className="stats__dayBody">
        <Turntable
          byHour={byHour}
          hoveredHour={hoveredHour}
          hoveredPart={hoveredPart}
          onHoverHour={setHoveredHour}
          peakStart={peak.start}
        />
        <ol className="chrome__srOnly">
          {byHour.map(({ hour, plays }) => (
            <li key={hour}>
              {formatHour(hour)}, {formatCount(plays)} plays
            </li>
          ))}
        </ol>
        <ul className="stats__shifts">
          {DAY_PARTS.map(({ label, part, startHour }) => {
            const partPlays = playsInDayPart(stats.hours, part);
            const isActive =
              hoveredPart === part || (hoveredHour !== null && dayPartOf(hoveredHour) === part);
            return (
              <li
                className={cx(
                  `stats__shift stats__shift--${part}`,
                  isActive && 'stats__shift--active',
                )}
                key={part}
                onMouseEnter={() => setHoveredPart(part)}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <span aria-hidden="true" className="stats__swatch" />
                <span className="stats__shiftShare">{formatPercent(partPlays, stats.plays)}</span>
                <span className="stats__meta">
                  {label}, {formatDayPartHours(startHour)}
                </span>
                <span className="stats__meta stats__shiftCounts">
                  {formatCount(partPlays)} plays ·{' '}
                  {formatHours((partPlays * stats.minutesPerPlay) / 60)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </PaperCard>
  );
}
