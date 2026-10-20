import 'server-only';

import { MapCard } from '@dg/maps/MapCard';
import { getCurrentLocation } from '../../services/contentful';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';

export async function MapCardSlot() {
  const location = await getCurrentLocation();
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
        <MapCard location={location} />
      </PaperCard>
      <PaperTag className="collagePin home__mapTag" edge="quad-c" tiltDeg={-2} tone="cream">
        <span>Home</span>
        <small>SF</small>
      </PaperTag>
    </div>
  );
}
