import { Stack } from '@mui/material';
import { useData } from 'api/useData';
import { ContentCard } from 'ui/dependent/ContentCard';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';

/**
 * Shows a card with the latest activity from Strava
 */
export function StravaCard() {
  const { data: activity } = useData('latest/activity');

  if (!activity?.id) {
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
          gap: 2,
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <ActivityStats />
        <Stack>
          <ActivityTypeWithIcon />
          <ActivityName sx={{ marginBottom: 1 }} url={url} />
          <ActivityDescription url={url} />
        </Stack>
      </Stack>
    </ContentCard>
  );
}
