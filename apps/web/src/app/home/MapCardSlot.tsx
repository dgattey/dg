import 'server-only';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';
import { getCurrentLocation } from '../../services/contentful';

export async function MapCardSlot({ fixture }: { fixture?: MapLocation | null } = {}) {
  if (fixture !== undefined) {
    return <MapCard location={fixture} />;
  }
  const location = await getCurrentLocation();
  return <MapCard location={location} />;
}
