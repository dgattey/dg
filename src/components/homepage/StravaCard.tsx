import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import Stack from 'components/Stack';
import truncated from 'helpers/truncated';
import useRelativeTimeFormat from 'hooks/useRelativeTimeFormat';
import React, { useMemo } from 'react';
import { FaBicycle, FaRunning, FaStrava } from 'react-icons/fa';
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

const PlainLink = styled.a`
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
      }),
    [],
  );

  if (!activity) {
    return null;
  }
  const typeText = activity.type === 'Ride' ? 'Ride' : 'Run';
  const icon = activity.type === 'Ride' ? <FaBicycle /> : <FaRunning />;
  const url = `https://www.strava.com/activities/${activity.id}`;
  const distance = activity.distance && formatter.format(activity.distance / METERS_TO_MILES);

  return (
    <Card>
      <Stack $isVertical $justifyContent="space-between">
        <Stack $justifyContent="space-between">
          <Stat>
            <Stack $alignItems="center" $gap="0.4rem">
              <FaStrava />
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
              <Stack $alignItems="center" $gap="0.4rem">
                Latest {typeText} {icon}
              </Stack>
            </StatusText>
          )}
          {activity.name && (
            <PlainLink href={url}>
              <Text>{activity.name}</Text>
            </PlainLink>
          )}
          {activity.description && (
            <Description>
              <PlainLink href={url}>{activity.description}</PlainLink>
            </Description>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default StravaCard;