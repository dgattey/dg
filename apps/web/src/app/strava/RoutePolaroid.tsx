import type { StravaOuting } from '@dg/content-models/strava/StravaHistory';
import { StravaRouteMap } from '@dg/maps/StravaRouteMap';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { cx } from '../collage/paperVars';
import { OutingStats } from './OutingMeta';

/**
 * A polaroid of one outing linking to the activity on Strava, its route inked
 * in vermilion over a Stadia map when it has one. `children` pin stickers to it.
 */
export function RoutePolaroid({
  children,
  className,
  outing,
  tiltDeg,
}: {
  children?: ReactNode;
  className?: string;
  outing: StravaOuting;
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
            <StravaRouteMap encodedPolyline={outing.polyline} />
          </span>
        ) : null}
        <span className="strava__polaroidName">{outing.name}</span>
        <OutingStats outing={outing} />
      </PaperCard>
      {children}
    </a>
  );
}
