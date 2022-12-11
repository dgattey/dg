import { useData } from 'api/useData';
import { FaIcon } from 'components/FaIcon';
import { useRelativeTimeFormat } from 'hooks/useRelativeTimeFormat';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { Typography } from '@mui/material';
import { HorizontalStack } from 'ui/HorizontalStack';
import { useFormattedDistance } from 'hooks/useFormattedDistance';

/**
 * Shows a horizontal stack of stats for the latest strava activity
 */
export function ActivityStats() {
  const { data: activity } = useData('latest/activity');

  const formattedDate = useRelativeTimeFormat({
    fromDate: activity?.start_date,
    capitalized: true,
  });
  const formattedDistance = useFormattedDistance({ distanceInMeters: activity?.distance });

  if (!activity?.start_date || !activity?.distance) {
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
        <Typography variant="caption">{formattedDistance}</Typography>
      </HorizontalStack>
      <Typography variant="caption">{formattedDate}</Typography>
    </HorizontalStack>
  );
}
