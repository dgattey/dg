import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { Typography } from '@dg/ui/core/Typography';
import type { CSSProperties, RefObject } from 'react';
import { Fragment, use } from 'react';
import { loadAlbumDetail } from '../../../services/albumDetail.actions';
import type { CollageCardTreatment } from '../../collage/collageCardTreatment';
import { AlbumDetailBody } from './AlbumDetailBody';
import { AlbumWell } from './AlbumWell';
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

const albumDetails = new Map<string, Promise<AlbumDetail | null | undefined>>();
const failedAlbumIds = new Set<string>();

/**
 * One request per album for the page's lifetime. Selecting an album happens in a
 * transition that suspends on this, so the grid keeps its current layout until the
 * well can open at its final height. A failed load stays failed until the visitor
 * asks for that album again, so rendering the failure never refetches in a loop.
 */
export function albumDetailFor(albumId: string, { retryFailed = false } = {}) {
  if (retryFailed && failedAlbumIds.delete(albumId)) {
    albumDetails.delete(albumId);
  }
  let detail = albumDetails.get(albumId);
  if (!detail) {
    detail = loadAlbumDetail(albumId).catch(() => {
      failedAlbumIds.add(albumId);
      return undefined;
    });
    albumDetails.set(albumId, detail);
  }
  return detail;
}

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
  );
}
