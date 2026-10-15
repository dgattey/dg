import 'server-only';

import { MapCard } from '@dg/maps/MapCard';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getCurrentLocation } from '../../services/contentful';
import { PaperCard } from '../collage/PaperCard';

export async function MapCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const location = await getCurrentLocation();
  if (surface !== 'collage') {
    return <MapCard location={location} surface="classic" />;
  }
  if (!location) {
    return null;
  }
  return (
    <div className="home__map">
      <PaperCard
        className="home__mapPaper"
        edge="soft-a"
        innerClassName="home__mapInner"
        tiltDeg={1.6}
        tone="cream"
      >
        <MapCard location={location} surface="collage" />
      </PaperCard>
    </div>
  );
}
