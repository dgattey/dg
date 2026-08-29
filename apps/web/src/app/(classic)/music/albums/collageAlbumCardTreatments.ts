import { invariant } from '@dg/shared-core/assertions/invariant';
import type { PaperTone } from '../../../collage/types';
import styles from './FavoriteAlbums.module.css';

export type CollageAlbumCardTreatment = {
  className?: string;
  tiltDeg: number;
  tone: PaperTone;
};

export const COLLAGE_ALBUM_GRID_COLUMNS = { lg: 5, md: 4, sm: 3, xs: 2 } as const;

const COLLAGE_ALBUM_CARD_TONES = [
  'ultramarine',
  'rose',
  'vermilion',
  'cream',
  'olive',
  'leaf',
  'viridian',
  'ochre',
] as const satisfies ReadonlyArray<PaperTone>;

const COLLAGE_ALBUM_CARD_LAYOUTS = [
  { className: styles.cardStagger0, tiltDeg: -2 },
  { className: styles.cardStagger10, tiltDeg: 1.5 },
  { className: styles.cardStagger0, tiltDeg: -1 },
  { className: styles.cardStagger14, tiltDeg: 2.4 },
  { className: styles.cardStagger0, tiltDeg: -1.6 },
  { className: styles.cardStagger8, tiltDeg: 1 },
] as const satisfies ReadonlyArray<Omit<CollageAlbumCardTreatment, 'tone'>>;

export function collageAlbumCardTreatment(index: number): CollageAlbumCardTreatment {
  const tone = COLLAGE_ALBUM_CARD_TONES[index % COLLAGE_ALBUM_CARD_TONES.length];
  const layout = COLLAGE_ALBUM_CARD_LAYOUTS[index % COLLAGE_ALBUM_CARD_LAYOUTS.length];
  invariant(tone && layout, 'Collage album card treatment registries must not be empty');
  return { ...layout, tone };
}

export function collageAlbumCardClassName(
  treatment: CollageAlbumCardTreatment,
  selected = false,
): string {
  return [styles.collageCard, treatment.className, selected ? styles.collageSelected : undefined]
    .filter((className) => className !== undefined)
    .join(' ');
}
