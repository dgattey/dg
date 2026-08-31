import 'server-only';

import { MapCard } from '@dg/maps/MapCard';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getCurrentLocation } from '../../services/contentful';
import styles from '../collage/home.module.css';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';

function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

export async function MapCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const location = await getCurrentLocation();
  if (surface !== 'collage') {
    return <MapCard location={location} surface="classic" />;
  }
  if (!location) {
    return null;
  }
  const coordinates = `${formatCoordinate(location.point.latitude, 'N', 'S')} · ${formatCoordinate(location.point.longitude, 'E', 'W')}`;
  return (
    <div className={styles.map}>
      <PaperCard
        className={styles.mapPaper}
        edge="torn-a"
        innerClassName={styles.mapInner}
        tiltDeg={1.6}
        tone="cream"
      >
        <MapCard location={location} surface="collage" />
      </PaperCard>
      <PaperTag className={`collagePin ${styles.mapTag}`} edge="quad-c" tiltDeg={-2} tone="cream">
        <span>{location.title}</span>
        <small>{coordinates}</small>
      </PaperTag>
    </div>
  );
}
