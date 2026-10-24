import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import { RoutePrint } from '@dg/maps/RoutePrint';
import type { TileSource } from '@dg/maps/src/tileSource';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { cx, paperToneVars } from '../collage/paperVars';
import { formatDuration, formatFeet, formatMiles, formatOutingDay } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';

/** A small chip in the sport's paper, matching its ink on the maps. */
export function SportChip({ sport }: { sport: StravaSport }) {
  const { label, tone } = SPORT_DETAILS[sport];
  return (
    <span className="strava__sport" style={paperToneVars(tone)}>
      {label}
    </span>
  );
}

/**
 * A polaroid of one outing linking to the activity on Strava, its route inked
 * in its sport's tone over a Stadia map when it has one. `dated` captions it
 * with the sport and when it happened, and `children` pin stickers to it.
 */
export function RoutePolaroid({
  children,
  className,
  dated = false,
  note,
  outing,
  tileSource,
  tiltDeg,
}: {
  children?: ReactNode;
  className?: string;
  dated?: boolean;
  note?: string | null;
  outing: StravaLogEntry;
  tileSource: TileSource;
  tiltDeg: number;
}) {
  return (
    <a
      aria-label={`${outing.name} on Strava`}
      className={cx('strava__polaroid collageLift', className)}
      href={outing.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <PaperCard edge="quad-a" innerClassName="strava__polaroidInner" tiltDeg={tiltDeg}>
        {outing.polyline ? (
          <span aria-hidden="true" className="strava__print">
            <RoutePrint
              encodedPolyline={outing.polyline}
              tileSource={tileSource}
              tone={SPORT_DETAILS[outing.sport].tone}
            />
          </span>
        ) : null}
        {dated ? (
          <span className="strava__polaroidMeta">
            <SportChip sport={outing.sport} />
            <span>
              <RelativeTime date={outing.startDate} hasTooltip={false} isCapitalized /> ·{' '}
              {formatOutingDay(outing.startDate)}
            </span>
          </span>
        ) : null}
        <span className="strava__polaroidName">{outing.name}</span>
        <span className="strava__stats">
          <span>{formatMiles(outing.distanceMeters)} mi</span>
          <span>{formatDuration(outing.movingTimeSeconds)}</span>
          <span>{formatFeet(outing.elevationGainMeters)} ft</span>
        </span>
        {note ? <span className="strava__polaroidNote">{note}</span> : null}
      </PaperCard>
      {children}
    </a>
  );
}
