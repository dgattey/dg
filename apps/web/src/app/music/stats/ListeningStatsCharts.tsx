import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatDay,
  formatHourRange,
  formatPacificDay,
  formatPercent,
  formatYearTick,
  HOUR_SHIFTS,
  hourShift,
  peakHours,
  playsInShift,
  weekdayExtremes,
  weekdayGroups,
} from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';

export function YearsCard({ stats }: { stats: ListeningStats }) {
  const max = Math.max(...stats.years.map((year) => year.plays));
  const peak = stats.years.find((year) => year.plays === max);
  const last = stats.years.length - 1;
  return (
    <PaperCard
      className="stats__card stats__years"
      innerClassName="stats__pad"
      tiltDeg={-0.5}
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
              <span className="stats__visuallyHidden">{year.year}</span>
              <span aria-hidden="true">{formatYearTick(year.year)}</span>
            </span>
            <span className="stats__visuallyHidden">: {formatCount(year.plays)} plays</span>
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

export function DayCard({ stats }: { stats: ListeningStats }) {
  const max = Math.max(...stats.hours);
  const peak = peakHours(stats.hours, 2);
  const isPeak = (hour: number) => (hour - peak.start + 24) % 24 < 2;
  // Hour columns are narrower than a value label, so only the busiest one carries a number.
  const busiest = stats.hours.indexOf(max);
  return (
    <PaperCard className="stats__card stats__day" innerClassName="stats__pad">
      <CardHead
        aside={`${formatHourRange(peak.start, 2)} peak: ${formatCount(peak.plays)} plays, ${formatPercent(peak.plays, stats.plays)}`}
        title="A day of listening, Pacific time"
      />
      <ol className="stats__hours">
        {stats.hours.map((plays, hour) => (
          <li
            className={cx(
              'stats__hour',
              `stats__hour--${hourShift(hour)}`,
              isPeak(hour) && 'stats__hour--peak',
            )}
            // biome-ignore lint/suspicious/noArrayIndexKey: the index is the hour itself
            key={hour}
          >
            <span className="stats__hourValue">
              {hour === busiest ? formatCompact(plays) : null}
            </span>
            <span aria-hidden="true" className="stats__hourBar" style={bar(plays, max)} />
            <span className="stats__hourTick">{String(hour).padStart(2, '0')}</span>
            <span className="stats__visuallyHidden">: {formatCount(plays)} plays</span>
          </li>
        ))}
      </ol>
      <ul className="stats__shifts">
        {HOUR_SHIFTS.map(({ label, shift }) => (
          <li className={`stats__shift stats__shift--${shift}`} key={shift}>
            <span aria-hidden="true" className="stats__swatch" />
            <span className="stats__shiftShare">
              {formatPercent(playsInShift(stats.hours, shift), stats.plays)}
            </span>
            <span className="stats__meta">{label}</span>
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

export function WeekCard({ stats }: { stats: ListeningStats }) {
  const groups = weekdayGroups(stats.weekdays);
  const { busiest, quietest } = weekdayExtremes(stats.weekdays);
  return (
    <PaperCard
      className="stats__card stats__week"
      innerClassName="stats__pad"
      tiltDeg={-0.6}
      tone="rose"
    >
      <CardHead title="Day of week" />
      <div aria-hidden="true" className="stats__split">
        {groups.map((group, i) => (
          <span
            className={`stats__splitPart stats__splitPart--${i}`}
            key={group.label}
            style={{ flexGrow: group.plays }}
          />
        ))}
      </div>
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
