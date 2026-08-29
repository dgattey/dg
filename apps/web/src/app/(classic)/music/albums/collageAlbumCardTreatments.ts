import { invariant } from '@dg/shared-core/helpers/invariant';
import type { PaperTone } from '../../../collage/types';
import styles from './FavoriteAlbums.module.css';

export type CollageAlbumCardTreatment = {
  className: string;
  tiltDeg: number;
  tone: PaperTone;
};

export const COLLAGE_ALBUM_GRID_COLUMNS = { lg: 5, md: 4, sm: 3, xs: 2 } as const;
export const COLLAGE_ALBUM_CAPTION_RESERVE_PX = 76;
export const COLLAGE_ALBUM_GRID_GAP_PX = { lg: 36, md: 36, sm: 24, xs: 24 } as const;

const COLLAGE_ALBUM_CARD_TREATMENTS = [
  { className: styles.cardStagger0, tiltDeg: -2, tone: 'ultramarine' },
  { className: styles.cardStagger10, tiltDeg: 1.5, tone: 'rose' },
  { className: styles.cardStagger0, tiltDeg: -1, tone: 'vermilion' },
  { className: styles.cardStagger14, tiltDeg: 2.4, tone: 'cream' },
  { className: styles.cardStagger0, tiltDeg: -1.6, tone: 'olive' },
  { className: styles.cardStagger8, tiltDeg: 1, tone: 'leaf' },
  { className: styles.cardStagger0, tiltDeg: -2.2, tone: 'viridian' },
  { className: styles.cardStagger10, tiltDeg: 1.8, tone: 'ochre' },
] as const satisfies ReadonlyArray<CollageAlbumCardTreatment>;

export function collageAlbumCardTreatment(index: number): CollageAlbumCardTreatment {
  const treatment = COLLAGE_ALBUM_CARD_TREATMENTS[index % COLLAGE_ALBUM_CARD_TREATMENTS.length];
  invariant(treatment, 'Collage album card treatment registry must not be empty');
  return treatment;
}

export function collageAlbumCardClassName(
  treatment: CollageAlbumCardTreatment,
  selected = false,
): string {
  return `${styles.collageCard} ${treatment.className}${selected ? ` ${styles.collageSelected}` : ''}`;
}
