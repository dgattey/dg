import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatDay,
  formatPacificDay,
  formatPercent,
  formatYearTick,
  WEEKDAY_NAMES,
  weekdayExtremes,
  weekdayGroupOf,
  weekdayGroups,
} from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';

export function YearsCard({ stats }: { stats: ListeningStats }) {
  const max = Math.max(...stats.years.map((year) => year.plays));
  const peak = stats.years.find((year) => year.plays === max);
  const last = stats.years.length - 1;
  return (
    <PaperCard
      className="stats__card stats__years stats__taped"
      edge="soft-a"
      innerClassName="stats__pad"
      tiltDeg={-1.1}
      tone="viridian"
    >
      <CardHead
        aside={
          peak ? (
            <span className="stats__peak">
              Peak {peak.year}: {formatCount(peak.plays)} plays,{' '}
              {formatCount((peak.plays * stats.minutesPerPlay) / 60)} hours
            </span>
          ) : null
        }
        title="Plays per year"
      />
      <ol className="stats__columns" style={{ '--count': stats.years.length } as CSSProperties}>
        {stats.years.map((year, i) => (
          <li
            className={cx(
              'stats__column',
              year === peak && 'stats__column--peak',
              year !== peak && (i === 0 || i === last) && 'stats__column--partial',
            )}
            key={year.year}
          >
            <span className="stats__columnValue">
              {year === peak ? formatCompact(year.plays) : null}
            </span>
            <span aria-hidden="true" className="stats__columnBar" style={bar(year.plays, max)} />
            <span className="stats__columnTick">
              <span className="chrome__srOnly">{year.year}</span>
              <span aria-hidden="true">{formatYearTick(year.year)}</span>
            </span>
            <span className="chrome__srOnly">: {formatCount(year.plays)} plays</span>
          </li>
        ))}
      </ol>
      <p className="stats__note">
        Faded columns are partial years, from {formatPacificDay(stats.firstPlayedAt)} to{' '}
        {formatPacificDay(stats.lastPlayedAt)}.
      </p>
    </PaperCard>
  );
}

/** A petal per weekday, Monday at the top, each as long as its share of plays. */
function WeekFlower({ weekdays }: { weekdays: ReadonlyArray<number> }) {
  const max = Math.max(...weekdays, 1);
  return (
    <svg aria-hidden="true" className="stats__flower" viewBox="-110 -110 220 220">
      {weekdays.map((plays, day) => {
        const length = 46 + (50 * plays) / max;
        const width = 19;
        const deg = (day * 360) / weekdays.length;
        return (
          <g key={WEEKDAY_NAMES[day]} transform={`rotate(${deg.toFixed(2)})`}>
            <path
              className={`stats__petal stats__splitPart--${weekdayGroupOf(day)}`}
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
  const groups = weekdayGroups(stats.weekdays);
  const { busiest, quietest } = weekdayExtremes(stats.weekdays);
  return (
    <PaperCard
      className="stats__card stats__week"
      edge="soft-b"
      innerClassName="stats__pad"
      tiltDeg={1.4}
      tone="rose"
    >
      <CardHead title="Day of week" />
      <div className="stats__weekBody">
        <WeekFlower weekdays={stats.weekdays} />
        <ul className="stats__splitKey">
          {groups.map((group, i) => (
            <li key={group.label}>
              <span aria-hidden="true" className={`stats__swatch stats__splitPart--${i}`} />
              <span>{group.label}</span>
              <span className="stats__meta">{formatCount(group.plays)}</span>
              <span className="stats__splitShare">{formatPercent(group.plays, stats.plays)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="stats__facts">
        <span>
          Busiest: <strong>{busiest.name}</strong>, {formatCount(busiest.plays)}
        </span>
        <span>
          Quietest: <strong>{quietest.name}</strong>, {formatCount(quietest.plays)}
        </span>
      </p>
      {stats.dayRepeats.length > 0 ? (
        <>
          <h3 className="stats__subheading">One track, one day</h3>
          <ul className="stats__dayRepeats">
            {stats.dayRepeats.map(({ day, plays, track }) => (
              <li key={track.id}>
                <span className="stats__label">{track.name}</span>
                <span className="stats__count">{plays}</span>
                <span className="stats__meta stats__date">{formatDay(day)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </PaperCard>
  );
}
