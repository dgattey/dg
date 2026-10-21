import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatHourRange,
  formatPercent,
  HOUR_SHIFTS,
  hourShift,
  peakHours,
  playsInShift,
} from './listeningStatsFormat';
import { CardHead } from './StatsCardParts';

const INNER = 58;
const REACH = 92;
const HALF_SPAN_DEG = 6.4;
const TICK_HOURS = [0, 6, 12, 18];

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

function Turntable({ byHour, peakStart }: { byHour: ReadonlyArray<HourPlays>; peakStart: number }) {
  const max = Math.max(...byHour.map(({ plays }) => plays), 1);
  const isPeak = (hour: number) => (hour - peakStart + 24) % 24 < 2;
  // Wedges are narrower than a value label, so only the busiest one carries a number.
  const busiest = byHour.find(({ plays }) => plays === max);
  const outer = (plays: number) => INNER + Math.max(4, (REACH * plays) / max);
  return (
    <svg aria-hidden="true" className="stats__clock" viewBox="-172 -172 344 344">
      <circle className="stats__clockGuide" r={INNER + REACH} />
      <circle className="stats__clockGuide" r={INNER + REACH / 2} />
      {byHour.map(({ hour, plays }) => (
        <path
          className={cx(
            'stats__wedge',
            `stats__shift--${hourShift(hour)}`,
            isPeak(hour) && 'stats__wedge--peak',
          )}
          d={wedgePath(hour, outer(plays))}
          key={hour}
        />
      ))}
      {TICK_HOURS.map((hour) => {
        const { x, y } = point(INNER + REACH + 14, hourAngle(hour));
        return (
          <text className="stats__clockTick" key={hour} x={x} y={y}>
            {String(hour).padStart(2, '0')}
          </text>
        );
      })}
      <circle className="stats__vinylDisc" r={INNER - 8} />
      {[44, 38, 32].map((r) => (
        <circle className="stats__vinylGroove" key={r} r={r} />
      ))}
      <circle className="stats__vinylLabel" r={18} />
      <circle className="stats__vinylHole" r={3.5} />
      {busiest ? (
        <text className="stats__clockValue" {...point(outer(max) + 18, hourAngle(busiest.hour))}>
          {formatCompact(max)}
        </text>
      ) : null}
    </svg>
  );
}

/** Plays by hour as petals around a record, with the share of each part of the day. */
export function ListeningClock({ stats }: { stats: ListeningStats }) {
  const peak = peakHours(stats.hours, 2);
  const byHour = stats.hours.map((plays, hour) => ({ hour, plays }));
  return (
    <PaperCard
      className="stats__card stats__day"
      edge="soft-a"
      innerClassName="stats__pad"
      tag={
        <PaperTag className="stats__pin" tiltDeg={6} tone="vermilion">
          {formatHourRange(peak.start, 2)} peak
        </PaperTag>
      }
      tiltDeg={-0.8}
    >
      <CardHead
        aside={`${formatCount(peak.plays)} plays at the peak, ${formatPercent(peak.plays, stats.plays)}`}
        title="A day of listening, Pacific time"
      />
      <div className="stats__dayBody">
        <Turntable byHour={byHour} peakStart={peak.start} />
        <ol className="chrome__srOnly">
          {byHour.map(({ hour, plays }) => (
            <li key={hour}>
              {String(hour).padStart(2, '0')}:00, {formatCount(plays)} plays
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
      </div>
    </PaperCard>
  );
}
