import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import { routeSilhouette } from '@dg/maps/src/routeFrame';
import { PaperCard } from '../collage/PaperCard';
import { paperToneVars } from '../collage/paperVars';
import { SportChip } from './RoutePolaroid';
import {
  formatDuration,
  formatFeet,
  formatMiles,
  formatOutingDate,
  formatOutingDay,
} from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';

const LOOP_SIZE = 30;

const fold = <span aria-hidden="true" className="strava__fold" />;

const nothingYet = (
  <li className="strava__emptyRow strava__soft">Nothing here for these filters</li>
);

function OutingLink({ className, outing }: { className: string; outing: StravaLogEntry }) {
  return (
    <a className={className} href={outing.url} rel="noopener noreferrer" target="_blank">
      {outing.name}
    </a>
  );
}

/** The route's shape alone, in the sport's ink, for the logbook margin. */
function Loop({ outing }: { outing: StravaLogEntry }) {
  const d = outing.polyline ? routeSilhouette(outing.polyline, LOOP_SIZE, 3) : null;
  return (
    <span className="strava__loop">
      {d ? (
        <svg
          aria-hidden="true"
          style={paperToneVars(SPORT_DETAILS[outing.sport].tone)}
          viewBox={`0 0 ${LOOP_SIZE} ${LOOP_SIZE}`}
        >
          <path d={d} />
        </svg>
      ) : null}
    </span>
  );
}

/** A ruled logbook slip of the latest outings, each with its loop in the margin. */
export function RecentOutings({ outings }: { outings: ReadonlyArray<StravaLogEntry> }) {
  return (
    <PaperCard
      className="strava__slip strava__log"
      edge="quad-a"
      innerClassName="strava__slipInner"
      tag={fold}
      tiltDeg={1.2}
    >
      <h2 className="strava__heading">Recent activities</h2>
      <ol className="strava__rows">
        {outings.length === 0 ? nothingYet : null}
        {outings.map((outing) => (
          <li className="strava__logRow" key={outing.id}>
            <Loop outing={outing} />
            <span className="strava__date strava__soft">{formatOutingDay(outing.startDate)}</span>
            <OutingLink className="strava__rowName" outing={outing} />
            <SportChip sport={outing.sport} />
            <span className="strava__number">{formatMiles(outing.distanceMeters)} mi</span>
            <span className="strava__number strava__soft">
              {formatFeet(outing.elevationGainMeters)} ft
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

/** A ruled library slip of the outings that climbed the most. */
export function BiggestClimbs({ outings }: { outings: ReadonlyArray<StravaLogEntry> }) {
  return (
    <PaperCard
      className="strava__slip strava__climbs"
      edge="quad-a"
      innerClassName="strava__slipInner strava__slipInner--margin"
      tag={fold}
      tiltDeg={-1.4}
    >
      <h2 className="strava__heading">Biggest climbs</h2>
      <ol className="strava__rows">
        {outings.length === 0 ? nothingYet : null}
        {outings.map((outing) => (
          <li className="strava__climbRow" key={outing.id}>
            <span className="strava__climbName">
              <OutingLink className="strava__rowName" outing={outing} />
              <span className="strava__date strava__soft">
                {formatMiles(outing.distanceMeters)} mi · {formatOutingDate(outing.startDate)}
              </span>
            </span>
            <span className="strava__number">{formatFeet(outing.elevationGainMeters)} ft</span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

/** A ruled slip of the longest outings, ranked, with how long and how high each went. */
export function LongestOutings({
  heading,
  outings,
}: {
  heading: string;
  outings: ReadonlyArray<StravaLogEntry>;
}) {
  return (
    <PaperCard
      className="strava__slip strava__distance"
      edge="quad-a"
      innerClassName="strava__slipInner strava__slipInner--margin"
      tag={fold}
      tiltDeg={-0.8}
    >
      <h2 className="strava__heading">{heading}</h2>
      <ol className="strava__rows">
        {outings.length === 0 ? nothingYet : null}
        {outings.map((outing, index) => (
          <li className="strava__distanceRow" key={outing.id}>
            <span className="strava__rank strava__soft">{index + 1}</span>
            <span className="strava__climbName">
              <OutingLink className="strava__rowName" outing={outing} />
              <span className="strava__date strava__soft">
                {formatOutingDate(outing.startDate)}
              </span>
            </span>
            <span className="strava__number">{formatMiles(outing.distanceMeters)} mi</span>
            <span className="strava__number strava__soft">
              {formatDuration(outing.movingTimeSeconds)}
            </span>
            <span className="strava__number strava__soft">
              {formatFeet(outing.elevationGainMeters)} ft
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}
