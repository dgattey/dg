import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Stack } from '@mui/material';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';

const cardSx: SxObject = {
  padding: 2.5,
};

const layoutStackSx: SxObject = {
  gap: 2,
  height: '100%',
  justifyContent: 'space-between',
};

const activityNameSx: SxObject = {
  marginBottom: 1,
};

/**
 * Shows a card with the latest activity from Strava
 */
export function StravaCard({ activity }: { activity: StravaActivity | null }) {
  if (!activity) {
    return null;
  }

  return (
    <ContentCard sx={cardSx}>
      <Stack sx={layoutStackSx}>
        <ActivityStats activity={activity} />
        <Stack>
          <ActivityTypeWithIcon activity={activity} />
          <ActivityName activity={activity} sx={activityNameSx} />
          <ActivityDescription activity={activity} />
        </Stack>
      </Stack>
    </ContentCard>
  );
}
