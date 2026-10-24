'use client';

import { type PeriodStatus, periodStatus } from '@dg/shared-core/dates/periodStatus';
import { useNow } from '@dg/ui/core/ServerTimeContext';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { cx } from '../collage/paperVars';
import type { PaperTone } from '../collage/types';
import { formatCompactFeet, formatFeet } from './stravaFormat';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const PETAL_TONES = [
  'ochre',
  'vermilion',
  'rose',
  'olive',
] as const satisfies ReadonlyArray<PaperTone>;
const SIZE = 350;
const CENTER = SIZE / 2;
const HEART = SIZE * 0.13;
const LABEL_GAP = 22;

const round = (value: number) => Math.round(value * 10) / 10;

/** A petal pointing right from the heart, `length` long, for a month's climbing. */
function petal(meters: number, most: number) {
  const length =
    meters > 0
      ? HEART + SIZE * 0.07 + (CENTER - HEART - SIZE * 0.165) * (meters / most)
      : HEART + SIZE * 0.033;
  const width = meters > 0 ? SIZE * 0.095 : SIZE * 0.024;
  const [base, belly, tip] = [round(HEART - 6), round(HEART + length * 0.25), round(length)];
  const shoulder = round(length - 10);
  const [w, w9] = [round(width), round(width * 0.9)];
  return {
    d: `M${base} 0C${belly} ${-w} ${shoulder} ${-w9} ${tip} 0C${shoulder} ${w9} ${belly} ${w} ${base} 0Z`,
    length,
    vein: `M${round(HEART + 4)} 0L${round(length - 16)} 0`,
  };
}

/**
 * How a month sits against today. Only a single year's flower has months that
 * haven't happened; across years every month has, though this one is still
 * adding up.
 */
function monthStatus(month: number, year: number | null, now: number): PeriodStatus {
  const thisYear = new Date(now).getUTCFullYear();
  const status = periodStatus(`${year ?? thisYear}-${String(month + 1).padStart(2, '0')}`, now);
  return year === null && status === 'future' ? 'past' : status;
}

/**
 * Climbing as a cut-paper flower: one petal per calendar month, longer for
 * more feet. `span` names the stretch of time the months cover and `year` is
 * set when that stretch is one calendar year. Hovering or focusing a petal
 * puts its month's climbing in the heart; months still to come are dotted
 * outlines that don't respond.
 */
export function ClimbingFlower({
  months,
  span,
  year,
}: {
  months: ReadonlyArray<number>;
  span: string;
  year: number | null;
}) {
  const now = useNow();
  const [picked, setPicked] = useState<number | null>(null);
  const most = Math.max(0, ...months);
  const total = months.reduce((sum, meters) => sum + meters, 0);
  const pickedMeters = picked === null ? null : (months[picked] ?? 0);
  const petals = months.map((meters, index) => {
    const status = monthStatus(index, year, now);
    const future = status === 'future';
    return {
      angle: (index / 12) * 360 - 90,
      future,
      index,
      meters,
      name: MONTHS[index] ?? '',
      status,
      ...petal(future ? 0 : meters, most),
    };
  });
  return (
    <PaperCard
      className="strava__flowerCard"
      edge="soft-b"
      innerClassName="strava__pad"
      tiltDeg={-2}
    >
      <div className="strava__head">
        <h2 className="strava__heading">Climbing by month</h2>
        <span className="strava__aside">
          {picked === null ? span : `${MONTHS[picked]} · ${formatFeet(pickedMeters ?? 0)} ft`}
        </span>
      </div>
      <div className="strava__flowerWrap">
        <svg
          aria-label={`${formatFeet(total)} feet climbed, ${span.toLowerCase()}, by month`}
          className={cx('strava__flower', picked !== null && 'strava__flower--engaged')}
          role="img"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {petals.map(({ angle, d, future, index, length, meters, name, status, vein }) => {
            const radians = (angle * Math.PI) / 180;
            const placed = `translate(${CENTER} ${CENTER}) rotate(${angle})`;
            return (
              <g
                className={cx(
                  'strava__petalGroup',
                  meters > 0 && !future ? undefined : 'strava__petal--none',
                  status === 'current' && 'strava__petal--current',
                  future && 'strava__petal--future',
                  picked === index && 'strava__petal--active',
                )}
                key={name}
              >
                <path
                  className="strava__petal"
                  d={d}
                  style={
                    meters > 0 && !future
                      ? ({
                          '--petal-fill': `var(--${PETAL_TONES[index % PETAL_TONES.length]})`,
                        } as CSSProperties)
                      : undefined
                  }
                  transform={placed}
                />
                {meters > 0 && !future ? (
                  <path className="strava__vein" d={vein} transform={placed} />
                ) : null}
                <text
                  className="strava__month"
                  x={round(CENTER + Math.cos(radians) * (length + LABEL_GAP))}
                  y={round(CENTER + Math.sin(radians) * (length + LABEL_GAP))}
                >
                  {name}
                </text>
              </g>
            );
          })}
          <circle className="strava__flowerHeart" cx={CENTER} cy={CENTER} r={HEART} />
          <text className="strava__flowerTotal" x={CENTER} y={CENTER - 4}>
            {formatCompactFeet(pickedMeters ?? total)}
          </text>
          <text className="strava__flowerUnit" x={CENTER} y={CENTER + 20}>
            {picked === null ? 'feet' : `ft · ${MONTHS[picked]}`}
          </text>
        </svg>
        <ol aria-label="Climbing by month" className="strava__petalHits">
          {petals
            .filter(({ future }) => !future)
            .map(({ angle, index, length, meters, name, status }) => {
              const hit: CSSProperties & Record<`--${string}`, string> = {
                '--angle': `${angle}deg`,
                '--length': `${(((length + LABEL_GAP * 1.6) / SIZE) * 100).toFixed(2)}cqw`,
              };
              return (
                <li key={name} style={hit}>
                  <button
                    aria-label={`${name}${status === 'current' ? ' so far' : ''}: ${formatFeet(meters)} ft`}
                    aria-pressed={picked === index}
                    className="strava__petalHit"
                    onBlur={() => setPicked(null)}
                    onFocus={() => setPicked(index)}
                    onMouseEnter={() => setPicked(index)}
                    onMouseLeave={() => setPicked(null)}
                    type="button"
                  />
                </li>
              );
            })}
        </ol>
      </div>
    </PaperCard>
  );
}
