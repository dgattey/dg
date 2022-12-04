import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import FaIcon from 'components/FaIcon';
import Stack from 'components/Stack';
import truncated from 'helpers/truncated';
import useRelativeTimeFormat from 'hooks/useRelativeTimeFormat';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { faBicycle } from '@fortawesome/free-solid-svg-icons/faBicycle';
import { faRunning } from '@fortawesome/free-solid-svg-icons/faRunning';
import { useMemo } from 'react';
import styled from 'styled-components';

// There are 1600 meters in one mile!
const METERS_TO_MILES = 1609.344;

// Stacks content and takes up space of parent
const Card = styled(ContentCard)`
  padding: var(--spacing);
  height: 100%;
  width: 100%;
  display: flex;
`;

const Group = styled.hgroup`
  --typography-spacing-vertical: 0.5rem;
`;

const Text = styled.h5`
  --typography-spacing-vertical: 0.25em;
  ${truncated(2)}
`;

const Description = styled(Text)`
  ${truncated(3)}
`;

const StatusText = styled(Text)`
  text-transform: uppercase;
  font-size: 0.65rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
`;

const Stat = styled(Text)`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
`;

// Opens link in new tab
const ExternalLink = styled.a.attrs({ target: '_blank', rel: 'noreferrer' })`
  color: inherit;
`;

/**
 * Shows a card with the latest activity from Strava
 */
const StravaCard = () => {
  const { data: activity } = useData('latest/activity');
  const date = useRelativeTimeFormat(activity?.start_date);
  const formatter = useMemo(
    () =>
      Intl.NumberFormat(undefined, {
        compactDisplay: 'long',
        maximumFractionDigits: 1,
      }),
    [],
  );

  if (!activity) {
    return null;
  }
  const typeText = activity.type === 'Ride' ? 'Ride' : 'Run';
  const icon = activity.type === 'Ride' ? <FaIcon icon={faBicycle} /> : <FaIcon icon={faRunning} />;
  const url = `https://www.strava.com/activities/${activity.id}`;
  const distance = activity.distance && formatter.format(activity.distance / METERS_TO_MILES);

  return (
    <Card>
      <Stack $isVertical $justifyContent="space-between">
        <Stack $justifyContent="space-between">
          <Stat>
            <Stack $alignItems="center" $gap="0.4rem">
              <FaIcon icon={faStrava} />
              {distance} Miles
            </Stack>
          </Stat>
          <Stat>
            {date[0]?.toUpperCase()}
            {date.slice(1)}
          </Stat>
        </Stack>
        <Group>
          {activity.type && (
            <StatusText>
              <Stack $alignItems="center" $gap="0.5rem">
                Latest {typeText} {icon}
              </Stack>
            </StatusText>
          )}
          {activity.name && (
            <ExternalLink href={url}>
              <Text>{activity.name}</Text>
            </ExternalLink>
          )}
          {activity.description && (
            <Description>
              <ExternalLink href={url}>{activity.description}</ExternalLink>
            </Description>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default StravaCard;
