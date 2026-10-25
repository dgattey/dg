import { Skeleton } from '@dg/ui/core/Skeleton';
import type { CSSProperties, ReactNode } from 'react';
import {
  type CollageCardTreatment,
  collageCardTreatment,
} from '../../collage/collageCardTreatment';
import { FilterBar } from '../../collage/FilterBar';
import { PaperCard } from '../../collage/PaperCard';
import { type PaperPillOption, PaperPills } from '../../collage/PaperPills';
import { PaperTag } from '../../collage/PaperTag';

type CardOffsetStyle = CSSProperties & {
  '--card-offset': string;
  '--card-offset-mobile': string;
};

export const COLLAGE_ALBUM_GRID_COLUMNS = { lg: 5, md: 4, sm: 3, xs: 2 } as const;

const COLLAGE_ALBUM_SORT_OPTIONS = [
  { key: 'released', label: 'Release date', shortLabel: 'Released', tiltDeg: -3 },
  { key: 'added', label: 'Recently added', shortLabel: 'Added', tiltDeg: 2.5 },
  { key: 'album', label: 'Album', tiltDeg: 2 },
  { key: 'artist', label: 'Artist', tiltDeg: -1.5 },
] as const satisfies ReadonlyArray<PaperPillOption<string>>;

export const DEFAULT_ALBUM_SORT = COLLAGE_ALBUM_SORT_OPTIONS[0].key;

function offsetStyle(treatment: CollageCardTreatment): CardOffsetStyle {
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
  treatment: CollageCardTreatment;
}) {
  return (
    <PaperCard
      className={selected ? `music__card music__selected` : 'music__card'}
      edge="quad-a"
      innerClassName="music__cardInner"
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
      <Skeleton className="music__art" variant="rounded" />
      <div className="music__caption">
        <Skeleton width="82%" />
        <Skeleton width="58%" />
      </div>
    </>
  );
}

export type AlbumSortKey = (typeof COLLAGE_ALBUM_SORT_OPTIONS)[number]['key'];

export function CollageSortControls({
  onSortChange,
  sortKey,
}: {
  onSortChange?: (key: AlbumSortKey) => void;
  sortKey: AlbumSortKey;
}) {
  return (
    <FilterBar className="music__sort">
      <PaperPills
        label={onSortChange ? 'Sort albums' : 'Loading album sort controls'}
        onSelect={onSortChange}
        options={COLLAGE_ALBUM_SORT_OPTIONS}
        selected={sortKey}
      />
    </FilterBar>
  );
}

export function CollageAlbumSkeletonGrid({ tileCount }: { tileCount: number }) {
  const tiles = Array.from({ length: tileCount }, (_, index) => ({
    key: `album-${index}`,
    treatment: collageCardTreatment(index),
  }));
  return (
    <div className="music__gridSkeleton">
      {tiles.map((tile) => (
        <CollageAlbumPaper key={tile.key} treatment={tile.treatment}>
          <SkeletonFace />
        </CollageAlbumPaper>
      ))}
    </div>
  );
}

export function CollageHistorySkeleton() {
  return (
    <div aria-label="Loading listening history" className="music__historySkeleton" role="status">
      {(
        [
          { label: 'recent', tiles: 12 },
          { label: 'earlier', tiles: 12 },
        ] as const
      ).map((section, sectionIndex) => (
        <section aria-hidden="true" className="music__section" key={section.label}>
          <div className="music__dateBar">
            <PaperTag
              className="music__dateTag"
              edge="soft-b"
              tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
              tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
            >
              <Skeleton width={120} />
            </PaperTag>
          </div>
          <div className="music__historySkeletonGrid">
            {Array.from({ length: section.tiles }, (_, cardIndex) => ({
              key: `${section.label}-${cardIndex}`,
              treatment: collageCardTreatment(cardIndex),
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
