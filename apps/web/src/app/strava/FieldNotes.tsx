import type { StravaHistory, StravaOuting } from '@dg/content-models/strava/StravaHistory';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { OutingStats, SportChip } from './OutingMeta';
import { RoutePolaroid } from './RoutePolaroid';
import { formatCompactFeet, formatMiles, formatOutingDay } from './stravaFormat';

const FIELD_PRINTS = 2;

function LatestNote({ outing }: { outing: StravaOuting }) {
  return (
    <div className="strava__latest">
      <PaperTag className="collagePin strava__latestTag" tiltDeg={-2} tone="black">
        Latest outing
      </PaperTag>
      <PaperCard
        className="strava__note"
        edge="torn-c"
        innerClassName="strava__noteInner"
        tiltDeg={-1.6}
        tone="ochre"
      >
        <span className="strava__meta">
          <SportChip sport={outing.sport} />
          {formatOutingDay(outing.startDate)}
          {outing.gearName ? ` · ${outing.gearName}` : null}
        </span>
        <a className="strava__noteName" href={outing.url} rel="noopener noreferrer" target="_blank">
          {outing.name}
        </a>
        <OutingStats outing={outing} />
        {outing.description ? <p className="strava__noteText">{outing.description}</p> : null}
      </PaperCard>
      <Scallop className="strava__latestSeal" tiltDeg={12} tone="vermilion">
        <span className="strava__sealKey">Latest</span>
        <span className="strava__sealWhen">
          <RelativeTime date={outing.startDate} hasTooltip={false} />
        </span>
      </Scallop>
    </div>
  );
}

/**
 * The column beside the atlas: the latest outing, prints of the next few,
 * lifetime seals, and the bike's odometer.
 */
export function FieldNotes({ history }: { history: StravaHistory }) {
  const { latest, odometer, totals } = history;
  const [first, second] = history.recent
    .slice(1)
    .filter((outing) => outing.polyline)
    .slice(0, FIELD_PRINTS);
  return (
    <div className="strava__field">
      <LatestNote outing={latest} />
      {first ? <RoutePolaroid className="strava__fieldPrint" outing={first} tiltDeg={2.6} /> : null}
      <div className="strava__seals">
        <Scallop className="strava__seal" tiltDeg={-10} tone="ochre">
          <span className="strava__sealKey">Total miles</span>
          <span className="strava__sealValue">{formatMiles(totals.distanceMeters)}</span>
          <span className="strava__sealKey">since {totals.firstYear}</span>
        </Scallop>
        <Scallop
          className="strava__seal strava__seal--small"
          size="sticker"
          tiltDeg={9}
          tone="viridian"
        >
          <span className="strava__sealKey">Climbed</span>
          <span className="strava__sealValue">{formatCompactFeet(totals.elevationGainMeters)}</span>
          <span className="strava__sealKey">feet</span>
        </Scallop>
      </div>
      {odometer ? (
        <Stub className="strava__odometer" kind="ticket" tiltDeg={-3} tone="cobalt">
          <span className="strava__sealKey">{odometer.gearName} odometer</span>
          <span className="strava__sealValue">{formatMiles(odometer.distanceMeters)} mi</span>
        </Stub>
      ) : null}
      {second ? (
        <RoutePolaroid className="strava__fieldPrint" outing={second} tiltDeg={-2.4} />
      ) : null}
    </div>
  );
}
