import type { StravaBike } from '@dg/content-models/strava/StravaHistory';
import type { CSSProperties } from 'react';
import { PaperTag } from '../collage/PaperTag';
import type { PaperTone } from '../collage/types';
import { Stub } from '../music/stats/StatsShapes';
import {
  formatCompactFeet,
  formatCount,
  formatHours,
  formatMiles,
  formatOutingDate,
} from './stravaFormat';

const BIKE_TONES = ['cobalt', 'ochre', 'rose'] as const satisfies ReadonlyArray<PaperTone>;
const BIKE_TILTS = [-1.6, 1.2, -1] as const;

const yearRange = ({ years }: StravaBike) => {
  const first = years.at(0)?.year;
  const last = years.at(-1)?.year;
  return first === last ? String(first) : `${first}–${last}`;
};

/** One bar per year the bike was ridden, tallest for its biggest year. */
function MilesByYear({ years }: Pick<StravaBike, 'years'>) {
  const most = Math.max(1, ...years.map(({ distanceMeters }) => distanceMeters));
  const label = years
    .map(({ distanceMeters, year }) => `${year}: ${formatMiles(distanceMeters)} mi`)
    .join(', ');
  return (
    <span aria-label={`Miles by year. ${label}`} className="strava__bikeYears" role="img">
      {years.map(({ distanceMeters, year }) => (
        <span aria-hidden="true" className="strava__bikeYear" key={year}>
          <span
            className="strava__bikeBar"
            style={{ '--bar': distanceMeters / most } as CSSProperties}
          />
          <span className="strava__bikeYearLabel">’{String(year).slice(-2)}</span>
        </span>
      ))}
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
            <Stub
              className="strava__bikeTicket"
              kind="ticket"
              tiltDeg={BIKE_TILTS[index % BIKE_TILTS.length] ?? 0}
              tone={BIKE_TONES[index % BIKE_TONES.length] ?? 'cobalt'}
            >
              <span className="strava__bikeHead">
                <span className="strava__bikeName">{bike.name}</span>
                <span className="strava__bikeSpan">{yearRange(bike)}</span>
              </span>
              <span className="strava__totalFigure">
                <span className="strava__bikeMiles">{formatMiles(bike.odometerMeters)}</span>
                <span className="strava__totalUnit">mi</span>
              </span>
              <span className="strava__bikeStats">
                <BikeStat
                  label="climbed"
                  value={`${formatCompactFeet(bike.elevationGainMeters)} ft`}
                />
                <BikeStat label="in the saddle" value={formatHours(bike.movingTimeSeconds)} />
                <BikeStat
                  label={bike.rides === 1 ? 'ride' : 'rides'}
                  value={formatCount(bike.rides)}
                />
              </span>
              <MilesByYear years={bike.years} />
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
          </li>
        ))}
      </ul>
    </section>
  );
}
