import 'server-only';

import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot() {
  const activity = await getLatestActivity();
  return <StravaCard activity={activity} />;
}
