import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { Typography } from '@dg/ui/core/Typography';
import { albumWellViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import type { CSSProperties, RefObject } from 'react';
import { Fragment, Suspense, use, ViewTransition } from 'react';
import type { CollageCardTreatment } from '../../collage/collageCardTreatment';
import { AlbumDetailBody, AlbumDetailBodySkeleton } from './AlbumDetailBody';
import { AlbumWell } from './AlbumWell';
import { albumDetailFor } from './albumDetailCache';
import { COLLAGE_ALBUM_GRID_COLUMNS } from './collageAlbumCardTreatments';

/**
 * Albums claim odd visual slots (`2i + 1`), leaving even slots for the well at
 * the end of the selected album's row across each breakpoint.
 */
function wellPlacementStyle(selectedIndex: number, albumCount: number): CSSProperties {
  const slotFor = (columns: number) =>
    2 * Math.min(albumCount, (Math.floor(selectedIndex / columns) + 1) * columns);
  const columns = COLLAGE_ALBUM_GRID_COLUMNS;

  return {
    '--well-order-lg': slotFor(columns.lg),
    '--well-order-md': slotFor(columns.md),
    '--well-order-sm': slotFor(columns.sm),
    '--well-order-xs': slotFor(columns.xs),
  } as CSSProperties;
}

export type AlbumCard = {
  album: PlaylistAlbum;
  treatment: CollageCardTreatment;
};

function SelectedAlbumDetail({
  detailPromise,
}: {
  detailPromise: Promise<AlbumDetail | null | undefined>;
}) {
  const detail = use(detailPromise);
  if (!detail) {
    return (
      <Typography color="var(--dg-palette-text-secondary)">
        Album details are temporarily unavailable. Please try again soon.
      </Typography>
    );
  }

  return <AlbumDetailBody album={detail} />;
}

/**
 * The `album-well` boundary wraps the slot itself: React only names an entering
 * or exiting `<ViewTransition>` that sits above the first DOM node it mounts.
 * Only the server-rendered album streams behind a skeleton. An album opened on the
 * client suspends its selection transition instead, so the well opens at its final height.
 */
export function SelectedAlbumWell({
  albumCount,
  initialDetail,
  selectedCard,
  selectedIndex,
  wellRef,
}: {
  albumCount: number;
  initialDetail: Promise<AlbumDetail | null | undefined> | undefined;
  selectedCard: AlbumCard | undefined;
  selectedIndex: number;
  wellRef: RefObject<HTMLDivElement | null>;
}) {
  if (!selectedCard) {
    return null;
  }

  return (
    <ViewTransition {...albumWellViewTransitionProps}>
      <div
        className="music__wellSlot"
        ref={wellRef}
        style={wellPlacementStyle(selectedIndex, albumCount)}
      >
        <AlbumWell album={selectedCard.album} tone={selectedCard.treatment.tone}>
          <Fragment key={selectedCard.album.id}>
            {initialDetail ? (
              <Suspense fallback={<AlbumDetailBodySkeleton />}>
                <SelectedAlbumDetail detailPromise={initialDetail} />
              </Suspense>
            ) : (
              <SelectedAlbumDetail detailPromise={albumDetailFor(selectedCard.album.id)} />
            )}
          </Fragment>
        </AlbumWell>
      </div>
    </ViewTransition>
  );
}
