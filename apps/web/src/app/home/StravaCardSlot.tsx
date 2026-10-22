import 'server-only';

import { getStravaHistory } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot() {
  return <StravaCard history={await getStravaHistory()} />;
}
