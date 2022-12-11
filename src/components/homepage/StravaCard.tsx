import { useData } from 'api/useData';
import { ContentCard } from 'components/ContentCard';
import { ActivityStats } from 'components/strava/ActivityStats';
import { ActivityTypeWithIcon } from 'components/strava/ActivityTypeWithIcon';
import { ActivityName } from 'components/strava/ActivityName';
import { ActivityDescription } from 'components/strava/ActivityDescription';
import { Stack } from '@mui/material';

/**
 * Shows a card with the latest activity from Strava
 */
export function StravaCard() {
  const { data: activity } = useData('latest/activity');

  if (!activity || !activity.id) {
    return null;
  }
  const url = `https://www.strava.com/activities/${activity.id}`;

  return (
    <ContentCard
      sx={{
        padding: 2.5,
      }}
    >
      <Stack
        sx={{
          justifyContent: 'space-between',
          gap: 2,
          height: '100%',
        }}
      >
        <ActivityStats />
        <Stack>
          <ActivityTypeWithIcon />
          <ActivityName url={url} sx={{ marginBottom: 1 }} />
          <ActivityDescription url={url} />
        </Stack>
      </Stack>
    </ContentCard>
  );
}
