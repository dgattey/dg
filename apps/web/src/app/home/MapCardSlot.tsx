import 'server-only';

import { MapCard } from '@dg/maps/MapCard';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getCurrentLocation } from '../../services/contentful';
import { CollageMapCard } from '../collage/CollageMapCard';

export async function MapCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const location = await getCurrentLocation();
  if (surface === 'collage') {
    return <CollageMapCard location={location} />;
  }
  return <MapCard location={location} surface="classic" />;
}
