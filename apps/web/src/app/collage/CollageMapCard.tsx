import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';
import styles from './HelloSheet.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';

function formatCoordinate(value: number, positive: string, negative: string): string {
  const direction = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(2)}° ${direction}`;
}

export function CollageMapCard({ location }: { location: MapLocation | null | undefined }) {
  if (!location) {
    return null;
  }

  const coordinates = `${formatCoordinate(
    location.point.latitude,
    'N',
    'S',
  )} · ${formatCoordinate(location.point.longitude, 'E', 'W')}`;

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
      <PaperTag className={styles.mapTag} edge="quad-c" tiltDeg={-2} tone="cream">
        <span>{location.title}</span>
        <small>{coordinates}</small>
      </PaperTag>
    </div>
  );
}
