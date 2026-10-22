import type { StravaOuting } from '@dg/content-models/strava/StravaHistory';
import { inBayArea } from '@dg/maps/bay/bayAtlas';
import { routeFocus } from '@dg/maps/bay/bayRoutes';
import type { MercatorFrame } from '@dg/maps/bay/mercatorFrame';
import type { ReactNode } from 'react';
import { BayMap } from '../collage/BayMap';
import { PaperCard } from '../collage/PaperCard';
import { cx } from '../collage/paperVars';
import { OutingStats } from './OutingMeta';

const PRINT_WIDTH = 272;
const PRINT_HEIGHT = 180;
const PRINT_PADDING = 24;

/** One route and the frame around it, for a polaroid's print. */
export type RoutePrint = { d: string; frame: MercatorFrame };

/** Frames an outing's route for a polaroid, or null when it has no route over the painted Bay. */
export function routePrint({ polyline }: StravaOuting): RoutePrint | null {
  const focus = polyline ? routeFocus(polyline, PRINT_WIDTH, PRINT_HEIGHT, PRINT_PADDING) : null;
  return focus && inBayArea(focus.frame) ? focus : null;
}

/**
 * A polaroid of one outing linking to the activity on Strava, its route inked
 * in vermilion over the watercolor Bay when there is a print. `children` pin
 * stickers to it.
 */
export function RoutePolaroid({
  children,
  className,
  outing,
  print,
  tiltDeg,
}: {
  children?: ReactNode;
  className?: string;
  outing: StravaOuting;
  print: RoutePrint | null;
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
        {print ? (
          <BayMap
            className="strava__print"
            frame={print.frame}
            highlight={print.d}
            title={outing.name}
          />
        ) : null}
        <span className="strava__polaroidName">{outing.name}</span>
        <OutingStats outing={outing} />
      </PaperCard>
      {children}
    </a>
  );
}
