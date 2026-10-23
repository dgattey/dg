'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatHours,
  formatPercent,
  formatYearTick,
  WEEKDAY_NAMES,
  weekdayExtremes,
  weekdayGroupOf,
  weekdayGroups,
} from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';

export function YearsCard({
  onSelectYear,
  stats,
}: {
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const max = Math.max(...stats.years.map((year) => year.plays), 1);
  const totalYearsPlays = stats.years.reduce((sum, year) => sum + year.plays, 0);
  const peak = stats.years.find((year) => year.plays === max);
  const last = stats.years.length - 1;
  const selectedYear = stats.range.kind === 'year' ? stats.range.year : null;
  const activeYearNum = hoveredYear ?? selectedYear;
  const activeEntry =
    activeYearNum !== null ? stats.years.find((year) => year.year === activeYearNum) : undefined;

  return (
    <PaperCard
      className="stats__card stats__years"
      edge="soft-a"
      innerClassName="stats__pad"
      tiltDeg={-1.1}
      tone="viridian"
    >
      <CardHead
        aside={
          activeEntry ? (
            <span className="stats__peak">
              {activeEntry === peak ? `Peak ${activeEntry.year}` : activeEntry.year}:{' '}
              {formatCount(activeEntry.plays)} plays,{' '}
              {formatCount((activeEntry.plays * stats.minutesPerPlay) / 60)} hours ·{' '}
              {formatPercent(activeEntry.plays, totalYearsPlays)}
            </span>
          ) : peak ? (
            <span className="stats__peak">
              Peak {peak.year}: {formatCount(peak.plays)} plays,{' '}
              {formatCount((peak.plays * stats.minutesPerPlay) / 60)} hours
            </span>
          ) : null
        }
        title="Plays per year"
      />
      <ol
        className={cx('stats__columns', activeYearNum !== null && 'stats__columns--engaged')}
        style={{ '--count': stats.years.length } as CSSProperties}
      >
        {stats.years.map((year, i) => {
          const isActive = activeYearNum === year.year;
          const showValue = year === peak || isActive;
          return (
            <li
              aria-label={`${year.year}: ${formatCount(year.plays)} plays`}
              className={cx(
                'stats__column',
                year === peak && 'stats__column--peak',
                year !== peak && (i === 0 || i === last) && 'stats__column--partial',
                isActive && 'stats__column--active',
              )}
              key={year.year}
              onClick={() => onSelectYear?.(year.year)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectYear?.(year.year);
                }
              }}
              onMouseEnter={() => setHoveredYear(year.year)}
              onMouseLeave={() => setHoveredYear(null)}
            >
              <span className="stats__columnValue">
                {showValue ? formatCompact(year.plays) : null}
              </span>
              <span aria-hidden="true" className="stats__columnBar" style={bar(year.plays, max)} />
              <span className="stats__columnTick">
                <span className="chrome__srOnly">{year.year}</span>
                <span aria-hidden="true">{formatYearTick(year.year)}</span>
              </span>
              <span className="chrome__srOnly">: {formatCount(year.plays)} plays</span>
            </li>
          );
        })}
      </ol>
    </PaperCard>
  );
}

/** A petal per weekday, Monday at the top, each as long as its share of plays. */
function WeekFlower({
  hoveredDay,
  hoveredGroup,
  onHoverDay,
  weekdays,
}: {
  hoveredDay: number | null;
  hoveredGroup: number | null;
  onHoverDay: (day: number | null) => void;
  weekdays: ReadonlyArray<number>;
}) {
  const max = Math.max(...weekdays, 1);
  const engaged = hoveredDay !== null || hoveredGroup !== null;
  return (
    <svg
      aria-hidden="true"
      className="stats__flower"
      onPointerLeave={() => onHoverDay(null)}
      onPointerOver={(event) => {
        const target = (event.target as Element | null)?.closest?.('[data-day]');
        const attr = target?.getAttribute('data-day');
        onHoverDay(attr !== null && attr !== undefined ? Number(attr) : null);
      }}
      viewBox="-110 -110 220 220"
    >
      {weekdays.map((plays, day) => {
        const length = 46 + (50 * plays) / max;
        const width = 19;
        const deg = (day * 360) / weekdays.length;
        const groupIdx = weekdayGroupOf(day);
        const isActive = hoveredDay === day || (hoveredDay === null && hoveredGroup === groupIdx);
        return (
          <g
            className={cx(
              'stats__petalGroup',
              isActive && 'stats__petalGroup--active',
              engaged && !isActive && 'stats__petalGroup--dim',
            )}
            data-day={day}
            key={WEEKDAY_NAMES[day]}
            transform={`rotate(${deg.toFixed(2)})`}
          >
            <path
              className={`stats__petal stats__splitPart--${groupIdx}`}
              d={`M0 0 C${width} ${-length * 0.32} ${width} ${-length * 0.86} 0 ${-length} C${-width} ${-length * 0.86} ${-width} ${-length * 0.32} 0 0 Z`}
            />
            <text
              className="stats__petalDay"
              transform={`translate(0 ${-length - 9}) rotate(${-deg.toFixed(2)})`}
            >
              {WEEKDAY_NAMES[day]?.charAt(0)}
            </text>
          </g>
        );
      })}
      <circle className="stats__flowerHeart" r="15" />
    </svg>
  );
}

export function WeekCard({ stats }: { stats: ListeningStats }) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
  const groups = weekdayGroups(stats.weekdays);
  const { busiest, quietest } = weekdayExtremes(stats.weekdays);
  const hoveredDayPlays = hoveredDay !== null ? (stats.weekdays[hoveredDay] ?? 0) : null;
  const activeGroup = hoveredGroup !== null ? groups[hoveredGroup] : undefined;

  return (
    <PaperCard
      className="stats__card stats__week"
      edge="soft-b"
      innerClassName="stats__pad"
      tiltDeg={1.4}
      tone="rose"
    >
      <CardHead
        aside={
          hoveredDay !== null && hoveredDayPlays !== null ? (
            <span className="stats__weekReadout">
              <strong>{WEEKDAY_NAMES[hoveredDay]}</strong>: {formatCount(hoveredDayPlays)} plays ·{' '}
              {formatHours((hoveredDayPlays * stats.minutesPerPlay) / 60)} (
              {formatPercent(hoveredDayPlays, stats.plays)})
            </span>
          ) : activeGroup ? (
            <span className="stats__weekReadout">
              <strong>{activeGroup.label}</strong>: {formatCount(activeGroup.plays)} plays (
              {formatPercent(activeGroup.plays, stats.plays)})
            </span>
          ) : null
        }
        title="Day of week"
      />
      <div className="stats__weekBody">
        <WeekFlower
          hoveredDay={hoveredDay}
          hoveredGroup={hoveredGroup}
          onHoverDay={setHoveredDay}
          weekdays={stats.weekdays}
        />
        <ul className="stats__splitKey">
          {groups.map((group, i) => (
            <li
              className={cx(
                'stats__splitKeyRow',
                hoveredGroup === i && 'stats__splitKeyRow--active',
              )}
              key={group.label}
              onMouseEnter={() => setHoveredGroup(i)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <span aria-hidden="true" className={`stats__swatch stats__splitPart--${i}`} />
              <span>{group.label}</span>
              <span className="stats__meta">{formatCount(group.plays)}</span>
              <span className="stats__splitShare">{formatPercent(group.plays, stats.plays)}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul aria-label="Plays by weekday" className="stats__weekdayChips">
        {WEEKDAY_NAMES.map((name, day) => {
          const plays = stats.weekdays[day] ?? 0;
          const isActive = hoveredDay === day;
          return (
            <li
              className={cx('stats__weekdayChip', isActive && 'stats__weekdayChip--active')}
              key={name}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className="stats__weekdayShort">{name.slice(0, 3)}</span>
              <span className="stats__weekdayVal">{formatCompact(plays)}</span>
            </li>
          );
        })}
      </ul>
      <p className="stats__facts">
        <span>
          Busiest: <strong>{busiest.name}</strong>, {formatCount(busiest.plays)}
        </span>
        <span>
          Quietest: <strong>{quietest.name}</strong>, {formatCount(quietest.plays)}
        </span>
      </p>
    </PaperCard>
  );
}
