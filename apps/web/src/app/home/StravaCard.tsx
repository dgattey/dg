import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { StravaRouteMap } from '@dg/maps/StravaRouteMap';
import { PaperCard } from '../collage/PaperCard';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';

type StravaCardProps = {
  activity: StravaActivity | null;
};

export function StravaCard({ activity }: StravaCardProps) {
  if (!activity) {
    return null;
  }

  const encodedPolyline = activity.map?.summaryPolyline ?? activity.map?.polyline;

  return (
    <a
      aria-label={`${activity.name} on Strava`}
      className="home__strava collageLift"
      data-slot="st"
      href={activity.url}
      rel="noopener noreferrer"
      style={{ gridArea: 'st' }}
      target="_blank"
    >
      <PaperCard edge="soft-b" innerClassName="home__stravaInner" tiltDeg={1.2} tone="cream">
        {encodedPolyline ? (
          <span aria-hidden="true" className="home__stravaRoute">
            <StravaRouteMap encodedPolyline={encodedPolyline} />
          </span>
        ) : null}
        <div className="home__stravaStats">
          <ActivityStats activity={activity} />
        </div>
        <div className="home__stravaCopy">
          <ActivityTypeWithIcon activity={activity} />
          <ActivityName activity={activity} />
          <ActivityDescription activity={activity} />
        </div>
      </PaperCard>
    </a>
  );
}
