import type { StravaYearTotals } from '@dg/content-models/strava/StravaHistory';
import type { CSSProperties } from 'react';
import { PaperTag } from '../collage/PaperTag';
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
 */
export function YearlyMiles({ years }: { years: ReadonlyArray<StravaYearTotals> }) {
  const most = Math.max(0, ...years.map((year) => year.distanceMeters));
  if (most === 0) {
    return null;
  }
  const best = years.reduce((top, year) => (year.distanceMeters > top.distanceMeters ? year : top));
  return (
    <section className="strava__years">
      <h2 className="strava__tagHeading">
        <PaperTag tiltDeg={-2} tone="black">
          Yearly miles
        </PaperTag>
      </h2>
      <ol className="strava__yearList">
        {[...years].reverse().map((year, index) => {
          const placement: CSSProperties & Record<`--${string}`, string> = {
            '--nudge': `${pick(YEAR_NUDGES, index, 0)}px`,
            '--share': (year.distanceMeters / most).toFixed(3),
          };
          return (
            <li className="strava__year" key={year.year} style={placement}>
              <Stub
                className="strava__yearTicket"
                kind="ticket"
                tiltDeg={pick(YEAR_TILTS, index, 0)}
                tone={pick(YEAR_TONES, index, 'ochre')}
              >
                <span className="strava__yearLabel">{year.year}</span>
                <span className="strava__yearMiles">{formatMiles(year.distanceMeters)} mi</span>
              </Stub>
            </li>
          );
        })}
      </ol>
      {years.length > 1 ? (
        <Scallop className="strava__bestYear" size="sticker" tiltDeg={-12} tone="cobalt">
          <span className="strava__sealKey">Best year</span>
          <span className="strava__sealValue">{best.year}</span>
          <span className="strava__sealKey">{formatMiles(best.distanceMeters)} mi</span>
        </Scallop>
      ) : null}
    </section>
  );
}
