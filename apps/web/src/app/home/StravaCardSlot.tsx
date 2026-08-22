import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot({ fixture }: { fixture?: StravaActivity } = {}) {
  if (fixture) {
    return <StravaCard activity={fixture} />;
  }

  try {
    const activity = await getLatestActivity();
    return <StravaCard activity={activity} />;
  } catch {
    return null;
  }
}
