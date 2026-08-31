import { invariant } from '@dg/shared-core/assertions/invariant';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { Skeleton } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import { PaperCard } from '../../../collage/PaperCard';
import { PaperTag } from '../../../collage/PaperTag';
import type { PaperTone } from '../../../collage/types';
import styles from '../music.module.css';

export type CollageAlbumCardTreatment = {
  offsetPx: number;
  tiltDeg: number;
  tone: PaperTone;
};

type CardOffsetStyle = CSSProperties & {
  '--card-offset': string;
  '--card-offset-mobile': string;
};

export const COLLAGE_ALBUM_GRID_COLUMNS = { lg: 5, md: 4, sm: 3, xs: 2 } as const;

export const COLLAGE_ALBUM_SORT_OPTIONS = [
  { key: 'added', label: 'Recently added', tiltDeg: -3 },
  { key: 'album', label: 'Album', tiltDeg: 2 },
  { key: 'artist', label: 'Artist', tiltDeg: -1.5 },
  { key: 'released', label: 'Release date', tiltDeg: 2.5 },
] as const;

const TONES = [
  'ultramarine',
  'rose',
  'vermilion',
  'cream',
  'olive',
  'leaf',
  'viridian',
  'ochre',
] as const satisfies ReadonlyArray<PaperTone>;

const LAYOUTS = [
  { offsetPx: 0, tiltDeg: -2 },
  { offsetPx: 10, tiltDeg: 1.5 },
  { offsetPx: 0, tiltDeg: -1 },
  { offsetPx: 14, tiltDeg: 2.4 },
  { offsetPx: 0, tiltDeg: -1.6 },
  { offsetPx: 8, tiltDeg: 1 },
] as const satisfies ReadonlyArray<Omit<CollageAlbumCardTreatment, 'tone'>>;

export function collageAlbumCardTreatment(index: number): CollageAlbumCardTreatment {
  const tone = TONES[index % TONES.length];
  const layout = LAYOUTS[index % LAYOUTS.length];
  invariant(tone && layout, 'Collage album card treatment registries must not be empty');
  return { ...layout, tone };
}

function offsetStyle(treatment: CollageAlbumCardTreatment): CardOffsetStyle {
  return {
    '--card-offset': `${treatment.offsetPx}px`,
    '--card-offset-mobile': `${treatment.offsetPx === 0 ? 0 : 8}px`,
  };
}

export function CollageAlbumPaper({
  children,
  selected = false,
  treatment,
}: {
  children: ReactNode;
  selected?: boolean;
  treatment: CollageAlbumCardTreatment;
}) {
  return (
    <PaperCard
      className={selected ? `${styles.card} ${styles.selected}` : styles.card}
      edge="quad-a"
      innerClassName={styles.cardInner}
      style={offsetStyle(treatment)}
      tiltDeg={treatment.tiltDeg}
      tone={treatment.tone}
    >
      {children}
    </PaperCard>
  );
}

function SkeletonFace() {
  return (
    <>
      <Skeleton className={styles.art} height="auto" variant="rectangular" />
      <div className={styles.caption}>
        <Skeleton variant="text" width="82%" />
        <Skeleton variant="text" width="58%" />
      </div>
    </>
  );
}

export function CollageSortSkeleton() {
  return (
    <div aria-label="Loading album sort controls" className={styles.sortSkeleton} role="status">
      {COLLAGE_ALBUM_SORT_OPTIONS.map((sort, index) => (
        <PaperTag
          className={styles.sortTag}
          edge="quad-a"
          key={sort.key}
          tiltDeg={sort.tiltDeg}
          tone={index === 0 ? 'black' : 'cream'}
        >
          <Skeleton style={{ width: 74 }} variant="text" />
        </PaperTag>
      ))}
    </div>
  );
}

export function CollageAlbumSkeletonGrid({ tileCount }: { tileCount: number }) {
  const tiles = Array.from({ length: tileCount }, (_, index) => ({
    key: `album-${index}`,
    treatment: collageAlbumCardTreatment(index),
  }));
  return (
    <div className={styles.gridSkeleton}>
      {tiles.map((tile) => (
        <CollageAlbumPaper key={tile.key} treatment={tile.treatment}>
          <SkeletonFace />
        </CollageAlbumPaper>
      ))}
    </div>
  );
}

export function CollageAlbumReserveGrid({
  albums,
}: {
  albums: ReadonlyArray<{ artistNames: string; id: string; name: string }>;
}) {
  return (
    <div aria-hidden="true" className={`${styles.gridSkeleton} ${styles.albumReserve}`}>
      {albums.map((album, index) => (
        <CollageAlbumPaper key={album.id} treatment={collageAlbumCardTreatment(index)}>
          <div className={styles.art} />
          <span className={styles.caption}>
            <strong className={styles.albumName}>{album.name}</strong>
            <span className={styles.artist}>{album.artistNames}</span>
          </span>
        </CollageAlbumPaper>
      ))}
    </div>
  );
}

export function CollageHistorySkeleton() {
  return (
    <div aria-label="Loading listening history" className={styles.historySkeleton} role="status">
      {(
        [
          { label: 'recent', tiles: 12 },
          { label: 'earlier', tiles: 12 },
        ] as const
      ).map((section, sectionIndex) => (
        <section aria-hidden="true" className={styles.section} key={section.label}>
          <StickyFadeBar className={styles.dateBar} surface="collage">
            <PaperTag
              className={styles.dateTag}
              edge="torn-b"
              tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
              tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
            >
              <Skeleton style={{ width: 120 }} variant="text" />
            </PaperTag>
          </StickyFadeBar>
          <div className={styles.historySkeletonGrid}>
            {Array.from({ length: section.tiles }, (_, cardIndex) => ({
              key: `${section.label}-${cardIndex}`,
              treatment: collageAlbumCardTreatment(cardIndex),
            })).map((tile) => (
              <CollageAlbumPaper key={tile.key} treatment={tile.treatment}>
                <SkeletonFace />
              </CollageAlbumPaper>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
