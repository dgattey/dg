import 'server-only';

import { getCurrentLocation } from '../../services/contentful';
import { MapPreviewCard } from './MapPreviewCard';

export async function MapPreviewCardSlot() {
  const location = await getCurrentLocation();
  return <MapPreviewCard location={location} />;
}
