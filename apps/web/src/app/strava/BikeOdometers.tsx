import type { StravaBike } from '@dg/content-models/strava/StravaHistory';
import { PaperTag } from '../collage/PaperTag';
import type { PaperTone } from '../collage/types';
import { Stub } from '../music/stats/StatsShapes';
import { formatCount, formatMiles } from './stravaFormat';

const BIKE_TONES = ['cobalt', 'ochre', 'rose'] as const satisfies ReadonlyArray<PaperTone>;
const BIKE_TILTS = [-2.4, 1.8, -1.2] as const;

const yearRange = ({ firstYear, lastYear }: StravaBike) =>
  firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`;

/** One ticket per named bike with Strava's odometer reading, so it's clear what each name is. */
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
              <span className="strava__sealKey">{bike.name} · bike</span>
              <span className="strava__sealValue">{formatMiles(bike.odometerMeters)} mi</span>
              <span className="strava__sealKey">
                {formatCount(bike.rides)} {bike.rides === 1 ? 'ride' : 'rides'} · {yearRange(bike)}
              </span>
            </Stub>
          </li>
        ))}
      </ul>
    </section>
  );
}
