'use client';

import type { StravaBike, StravaBikeYear } from '@dg/content-models/strava/StravaHistory';
import { formatYearTick, periodStatus } from '@dg/shared-core/dates/periodStatus';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { useNow } from '@dg/ui/core/ServerTimeContext';
import { type CSSProperties, useState } from 'react';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import type { PaperTone } from '../collage/types';
import { Stub } from '../music/stats/StatsShapes';
import { BikeIllustration } from './BikeIllustrations';
import { formatCompactFeet, formatHours, formatMiles, formatOutingDate } from './stravaFormat';

const BIKE_TONES = ['cobalt', 'ochre', 'rose'] as const satisfies ReadonlyArray<PaperTone>;
const BIKE_TILTS = [-1.6, 1.2, -1] as const;

const yearRange = ({ years }: StravaBike) => {
  const first = years.at(0)?.year;
  const last = years.at(-1)?.year;
  return first === last ? String(first) : `${first}–${last}`;
};

/**
 * One bar per year the bike was ridden, tallest for its biggest year. The
 * year still underway gets a dashed bar; hovering or focusing a year hands it
 * to `onPick` so the card can show that year's numbers.
 */
function MilesByYear({
  onPick,
  picked,
  years,
}: {
  onPick: (year: number | null) => void;
  picked: number | null;
  years: ReadonlyArray<StravaBikeYear>;
}) {
  const now = useNow();
  const most = Math.max(1, ...years.map(({ distanceMeters }) => distanceMeters));
  return (
    <span className={cx('strava__bikeYears', picked !== null && 'strava__bikeYears--engaged')}>
      {years.map(({ distanceMeters, year }) => {
        const current = periodStatus(String(year), now) === 'current';
        return (
          <button
            aria-label={`${year}${current ? ' so far' : ''}: ${formatMiles(distanceMeters)} mi`}
            aria-pressed={picked === year}
            className={cx(
              'strava__bikeYear',
              current && 'strava__bikeYear--current',
              picked === year && 'strava__bikeYear--active',
            )}
            key={year}
            onBlur={() => onPick(null)}
            onFocus={() => onPick(year)}
            onMouseEnter={() => onPick(year)}
            onMouseLeave={() => onPick(null)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="strava__bikeBar"
              style={{ '--bar': distanceMeters / most } as CSSProperties}
            />
            <span aria-hidden="true" className="strava__bikeYearLabel">
              {formatYearTick(year)}
            </span>
          </button>
        );
      })}
    </span>
  );
}

function BikeStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="strava__bikeStat">
      <span className="strava__bikeStatValue">{value}</span>
      <span className="strava__bikeStatLabel">{label}</span>
    </span>
  );
}

function BikeTicket({ bike, index }: { bike: StravaBike; index: number }) {
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const picked = bike.years.find(({ year }) => year === pickedYear);
  const shown = picked
    ? {
        distanceMeters: picked.distanceMeters,
        elevationGainMeters: picked.elevationGainMeters,
        movingTimeSeconds: picked.movingTimeSeconds,
        rides: picked.rides,
        span: String(picked.year),
      }
    : {
        distanceMeters: bike.odometerMeters,
        elevationGainMeters: bike.elevationGainMeters,
        movingTimeSeconds: bike.movingTimeSeconds,
        rides: bike.rides,
        span: yearRange(bike),
      };
  return (
    <Stub
      className={cx('strava__bikeTicket', picked && 'strava__bikeTicket--year')}
      kind="ticket"
      tiltDeg={BIKE_TILTS[index % BIKE_TILTS.length] ?? 0}
      tone={BIKE_TONES[index % BIKE_TONES.length] ?? 'cobalt'}
    >
      <span className="strava__bikeHead">
        <span className="strava__bikeLead">
          <span className="strava__bikeTitle">
            <span className="strava__bikeName">{bike.name}</span>
            <span aria-live="polite" className="strava__bikeSpan">
              {shown.span}
            </span>
          </span>
          <span className="strava__totalFigure">
            <span className="strava__bikeMiles">{formatMiles(shown.distanceMeters)}</span>
            <span className="strava__totalUnit">mi</span>
          </span>
        </span>
        <BikeIllustration name={bike.name} />
      </span>
      <span className="strava__bikeStats">
        <BikeStat label="climbed" value={`${formatCompactFeet(shown.elevationGainMeters)} ft`} />
        <BikeStat label="in the saddle" value={formatHours(shown.movingTimeSeconds)} />
        <BikeStat label={shown.rides === 1 ? 'ride' : 'rides'} value={formatCount(shown.rides)} />
      </span>
      <MilesByYear onPick={setPickedYear} picked={pickedYear} years={bike.years} />
      <a
        className="strava__bikeLongest"
        href={bike.longest.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="strava__bikeLongestKey">
          Longest · {formatMiles(bike.longest.distanceMeters)} mi ·{' '}
          {formatOutingDate(bike.longest.startDate)}
        </span>
        <span className="strava__bikeLongestName">{bike.longest.name}</span>
      </a>
    </Stub>
  );
}

/** One ticket per named bike: Strava's odometer, what its rides add up to, and its longest day. */
export function BikeOdometers({ bikes }: { bikes: ReadonlyArray<StravaBike> }) {
  if (bikes.length === 0) {
    return null;
  }
  return (
    <section className="strava__bikes">
      <h2 className="strava__tagHeading">
        <PaperTag tiltDeg={2} tone="black">
          Bike odometers
        </PaperTag>
      </h2>
      <ul className="strava__bikeList">
        {bikes.map((bike, index) => (
          <li key={bike.id}>
            <BikeTicket bike={bike} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}
