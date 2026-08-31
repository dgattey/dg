import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { StravaRouteMap } from '@dg/maps/StravaRouteMap';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';
import styles from './CollageStravaCard.module.css';
import { PaperCard } from './PaperCard';
import sheetStyles from './WorkSheet.module.css';

type CollageStravaCardProps = {
  activity: StravaActivity;
  encodedPolyline?: string;
};

export function CollageStravaCard({ activity, encodedPolyline }: CollageStravaCardProps) {
  return (
    <div className={sheetStyles.strava} data-slot="st">
      <PaperCard edge="torn-b" innerClassName={styles.inner} tiltDeg={1.2} tone="olive">
        {encodedPolyline ? (
          <span aria-hidden="true" className={styles.route}>
            <StravaRouteMap encodedPolyline={encodedPolyline} surface="collage" />
          </span>
        ) : null}
        <div className={styles.content}>
          <ActivityStats activity={activity} />
          <div className={styles.copy}>
            <ActivityTypeWithIcon activity={activity} />
            <ActivityName activity={activity} />
            <ActivityDescription activity={activity} />
          </div>
        </div>
      </PaperCard>
    </div>
  );
}
