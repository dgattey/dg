import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot({
  fixture,
  typeScale,
}: {
  fixture?: StravaActivity;
  typeScale?: 'default' | 'greenhouse';
} = {}) {
  if (fixture) {
    return <StravaCard activity={fixture} typeScale={typeScale} />;
  }

  try {
    const activity = await getLatestActivity();
    return <StravaCard activity={activity} typeScale={typeScale} />;
  } catch {
    return null;
  }
}
