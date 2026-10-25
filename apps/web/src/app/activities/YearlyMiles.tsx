'use client';

import type { StravaYearTotals } from '@dg/content-models/strava/StravaHistory';
import { periodStatus } from '@dg/shared-core/dates/periodStatus';
import { useNow } from '@dg/ui/core/ServerTimeContext';
import { type CSSProperties, useState } from 'react';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import type { PaperTone } from '../collage/types';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { formatMiles } from './stravaFormat';

const YEAR_TONES = [
  'ochre',
  'vermilion',
  'cobalt',
  'olive',
  'rose',
  'viridian',
] as const satisfies ReadonlyArray<PaperTone>;
const YEAR_TILTS = [-1.6, 1.2, -0.6, 1.8, -1.2, 0.8] as const;
const YEAR_NUDGES = [0, 14, 4, 20, 8, 16] as const;

const pick = <T,>(list: ReadonlyArray<T>, index: number, fallback: T) =>
  list[index % list.length] ?? fallback;

/**
 * One ticket per year, newest first, each torn to a length that reads as that
 * year's miles, with the best year stickered on when there is more than one.
 * The year still underway gets a dashed edge, and hovering or focusing a
 * ticket moves the sticker to that year.
 */
export function YearlyMiles({ years }: { years: ReadonlyArray<StravaYearTotals> }) {
  const now = useNow();
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const most = Math.max(0, ...years.map((year) => year.distanceMeters));
  if (most === 0) {
    return null;
  }
  const best = years.reduce((top, year) => (year.distanceMeters > top.distanceMeters ? year : top));
  const shown = years.find((year) => year.year === pickedYear) ?? best;
  return (
    <section className="strava__years">
      <h2 className="strava__tagHeading">
        <PaperTag tiltDeg={-2} tone="black">
          Yearly miles
        </PaperTag>
      </h2>
      <ol className={cx('strava__yearList', pickedYear !== null && 'strava__yearList--engaged')}>
        {[...years].reverse().map((year, index) => {
          const placement: CSSProperties & Record<`--${string}`, string> = {
            '--nudge': `${pick(YEAR_NUDGES, index, 0)}px`,
            '--share': (year.distanceMeters / most).toFixed(3),
          };
          const current = periodStatus(String(year.year), now) === 'current';
          return (
            <li
              className={cx(
                'strava__year',
                current && 'strava__year--current',
                pickedYear === year.year && 'strava__year--active',
              )}
              key={year.year}
              style={placement}
            >
              <button
                aria-label={`${year.year}${current ? ' so far' : ''}: ${formatMiles(year.distanceMeters)} mi`}
                aria-pressed={pickedYear === year.year}
                className="strava__yearButton"
                onBlur={() => setPickedYear(null)}
                onFocus={() => setPickedYear(year.year)}
                onMouseEnter={() => setPickedYear(year.year)}
                onMouseLeave={() => setPickedYear(null)}
                type="button"
              >
                <Stub
                  className="strava__yearTicket"
                  kind="ticket"
                  size="sm"
                  tiltDeg={pick(YEAR_TILTS, index, 0)}
                  tone={pick(YEAR_TONES, index, 'ochre')}
                >
                  <span className="strava__yearLabel">{year.year}</span>
                  <span className="strava__yearMiles">{formatMiles(year.distanceMeters)} mi</span>
                </Stub>
              </button>
            </li>
          );
        })}
      </ol>
      {years.length > 1 ? (
        <Scallop className="strava__bestYear" size="sticker" tiltDeg={-12} tone="cobalt">
          <span className="strava__sealKey">
            {shown === best
              ? 'Best year'
              : periodStatus(String(shown.year), now) === 'current'
                ? 'So far'
                : 'Year'}
          </span>
          <span className="strava__sealValue">{shown.year}</span>
          <span className="strava__sealKey">{formatMiles(shown.distanceMeters)} mi</span>
        </Scallop>
      ) : null}
    </section>
  );
}
