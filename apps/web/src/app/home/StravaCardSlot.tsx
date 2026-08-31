import 'server-only';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const activity = await getLatestActivity();
  return <StravaCard activity={activity} surface={surface} />;
}
