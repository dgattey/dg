import 'server-only';

import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot() {
  try {
    const activity = await getLatestActivity();
    return <StravaCard activity={activity} />;
  } catch {
    return null;
  }
}
