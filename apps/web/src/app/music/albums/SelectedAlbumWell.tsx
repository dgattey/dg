import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { Typography } from '@dg/ui/core/Typography';
import { albumWellViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import type { CSSProperties, RefObject } from 'react';
import { Fragment, use, ViewTransition } from 'react';
import type { CollageCardTreatment } from '../../collage/collageCardTreatment';
import { AlbumDetailBody } from './AlbumDetailBody';
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

function SelectedAlbumDetail({ albumId }: { albumId: string }) {
  const detail = use(albumDetailFor(albumId));
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
 */
export function SelectedAlbumWell({
  albumCount,
  selectedCard,
  selectedIndex,
  wellRef,
}: {
  albumCount: number;
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
            <SelectedAlbumDetail albumId={selectedCard.album.id} />
          </Fragment>
        </AlbumWell>
      </div>
    </ViewTransition>
  );
}
