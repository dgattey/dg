import 'server-only';

import { MapCard } from '@dg/maps/MapCard';
import { getCurrentLocation } from '../../services/contentful';

export async function MapCardSlot() {
  const location = await getCurrentLocation();
  return <MapCard location={location} />;
}
