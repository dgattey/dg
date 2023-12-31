import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { Typography } from '@mui/material';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import { formattedDistance } from 'shared-core/helpers/formattedDistance';
import { FaIcon } from 'ui/icons/FaIcon';
import { useRelativeTimeFormat } from 'ui/helpers/useRelativeTimeFormat';
import { useData } from 'api/useData';

/**
 * Shows a horizontal stack of stats for the latest strava activity
 */
export function ActivityStats() {
  const { data: activity } = useData('latest/activity');

  const formattedDate = useRelativeTimeFormat({
    fromDate: activity?.start_date,
    capitalized: true,
  });
  const distance = formattedDistance({ distanceInMeters: activity?.distance });

  if (!activity?.start_date || !activity.distance) {
    return null;
  }

  return (
    <HorizontalStack
      sx={{
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <HorizontalStack
        sx={{
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FaIcon icon={faStrava} />
        <Typography variant="caption">{distance}</Typography>
      </HorizontalStack>
      <Typography variant="caption">{formattedDate}</Typography>
    </HorizontalStack>
  );
}
