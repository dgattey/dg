import 'server-only';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';
import { getCurrentLocation } from '../../services/contentful';
import { LocationCard } from './LocationCard';

type MapCardVariant = 'bare' | 'location';

export async function MapCardSlot({
  fixture,
  variant = 'bare',
}: {
  fixture?: MapLocation | null;
  variant?: MapCardVariant;
} = {}) {
  const location = fixture !== undefined ? fixture : await getCurrentLocation();
  if (variant === 'location') {
    return <LocationCard location={location} />;
  }
  return <MapCard location={location} />;
}
