'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { Box } from '@dg/ui/core/Box';
import { Typography } from '@dg/ui/core/Typography';
import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import type { ReactNode } from 'react';
import { Children, Fragment, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { loadAlbumDetail } from '../../../services/albumDetail.actions';
import {
  type CollageCardTreatment,
  collageCardTreatment,
} from '../../collage/collageCardTreatment';
import { albumTileSlotSx } from '../albumTileGeometry';
import { AlbumDetailBody } from './AlbumDetailBody';
import { AlbumDetailBodySkeleton } from './AlbumDetailBodySkeleton';
import { AlbumWell } from './AlbumWell';
import {
  type AlbumSortKey,
  COLLAGE_ALBUM_GRID_COLUMNS,
  CollageSortControls,
} from './collageAlbumCardTreatments';
import { FavoriteAlbumCell } from './FavoriteAlbumCell';
import {
  type PendingSelection,
  resolveAlbumSelection,
  useOptimisticAlbumSelection,
  useUrlAlbumId,
} from './useOptimisticAlbumSelection';

const COLLAGE_FIRST_SCREEN_CELLS = COLLAGE_ALBUM_GRID_COLUMNS.xs * 2;

const comparators: Record<AlbumSortKey, (a: PlaylistAlbum, b: PlaylistAlbum) => number> = {
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
  album: (a, b) => a.name.localeCompare(b.name),
  artist: (a, b) => a.primaryArtist.localeCompare(b.primaryArtist) || a.name.localeCompare(b.name),
  released: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
};

function albumSlotSx(index: number): SxObject {
  return { ...albumTileSlotSx, order: 2 * index + 1 };
}

/**
 * Albums claim odd visual slots (`2i + 1`), leaving even slots for the well at
 * the end of the selected album's row across each breakpoint.
 */
function wellPlacementSx(selectedIndex: number, albumCount: number): SxObject {
  const slotFor = (columns: number) =>
    2 * Math.min(albumCount, (Math.floor(selectedIndex / columns) + 1) * columns);
  const columns = COLLAGE_ALBUM_GRID_COLUMNS;

  return {
    gridColumn: '1 / -1',
    order: {
      lg: slotFor(columns.lg),
      md: slotFor(columns.md),
      sm: slotFor(columns.sm),
      xs: slotFor(columns.xs),
    },
  };
}

type AlbumCard = {
  album: PlaylistAlbum;
  treatment: CollageCardTreatment;
};

type SelectedAlbumWellProps = {
  albumCards: Array<AlbumCard>;
  children?: ReactNode;
  pending: PendingSelection | null;
};

type AlbumDetailState =
  | { albumId: string; status: 'loading' }
  | { albumId: string; detail: AlbumDetail | null | undefined; status: 'loaded' };

function ClientSelectedAlbumDetail({ albumId }: { albumId: string }) {
  const [state, setState] = useState<AlbumDetailState>({ albumId, status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ albumId, status: 'loading' });
    void loadAlbumDetail(albumId)
      .then((detail) => {
        if (!cancelled) {
          setState({ albumId, detail, status: 'loaded' });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ albumId, detail: undefined, status: 'loaded' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  if (state.albumId !== albumId || state.status === 'loading') {
    return <AlbumDetailBodySkeleton />;
  }

  if (!state.detail) {
    return (
      <Typography color="text.secondary">
        Album details are temporarily unavailable. Please try again soon.
      </Typography>
    );
  }

  return <AlbumDetailBody album={state.detail} />;
}

function SelectedAlbumWell({ albumCards, children, pending }: SelectedAlbumWellProps) {
  const { isAwaitingDetail, selectedAlbumId } = resolveAlbumSelection(pending, useUrlAlbumId());
  const selectedIndex = albumCards.findIndex(({ album }) => album.id === selectedAlbumId);
  const selectedCard = albumCards[selectedIndex];

  if (!selectedCard) {
    return null;
  }

  const hasExplicitChildren = Children.count(children) > 0;

  return (
    <Box sx={wellPlacementSx(selectedIndex, albumCards.length)}>
      <AlbumWell album={selectedCard.album} tone={selectedCard.treatment.tone}>
        <Fragment key={selectedCard.album.id}>
          {isAwaitingDetail ? (
            <AlbumDetailBodySkeleton />
          ) : hasExplicitChildren ? (
            children
          ) : (
            <ClientSelectedAlbumDetail albumId={selectedCard.album.id} />
          )}
        </Fragment>
      </AlbumWell>
    </Box>
  );
}

type Props = {
  albums: Array<PlaylistAlbum>;
  children?: ReactNode;
};

export function FavoriteAlbumsGrid({ albums, children }: Props) {
  const { onAlbumNavigationCapture, pending, selectedAlbumId } = useOptimisticAlbumSelection();
  const [sortKey, setSortKey] = useState<AlbumSortKey>('added');
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const previousRects = useRef<Map<string, DOMRect> | null>(null);

  const handleSortChange = (next: AlbumSortKey) => {
    if (next === sortKey) {
      return;
    }
    previousRects.current = new Map(
      [...itemRefs.current].map(([id, element]) => [id, element.getBoundingClientRect()]),
    );
    setSortKey(next);
  };

  useLayoutEffect(() => {
    const previous = previousRects.current;
    previousRects.current = null;
    if (!previous || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    for (const [id, element] of itemRefs.current) {
      const before = previous.get(id);
      if (!before || typeof element.animate !== 'function') {
        continue;
      }
      const after = element.getBoundingClientRect();
      const deltaX = before.left - after.left;
      const deltaY = before.top - after.top;
      if (deltaX === 0 && deltaY === 0) {
        continue;
      }
      element.animate(
        [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
        { duration: TIMING_SLOW, easing: EASING_DEFAULT },
      );
    }
  });

  const albumCards = albums.map(
    (album, index): AlbumCard => ({
      album,
      treatment: collageCardTreatment(index),
    }),
  );
  const sortedAlbumCards = albumCards.sort((a, b) => comparators[sortKey](a.album, b.album));
  const selectedIndex = selectedAlbumId
    ? sortedAlbumCards.findIndex(({ album }) => album.id === selectedAlbumId)
    : -1;
  const wellSlot = (
    <Suspense fallback={null} key="album-well">
      <SelectedAlbumWell albumCards={sortedAlbumCards} pending={pending}>
        {children}
      </SelectedAlbumWell>
    </Suspense>
  );

  const renderAlbum = ({ album, treatment }: AlbumCard, index: number) => (
    <Box
      key={album.id}
      ref={(element: HTMLElement | null) => {
        if (element) {
          itemRefs.current.set(album.id, element);
        } else {
          itemRefs.current.delete(album.id);
        }
      }}
      sx={albumSlotSx(index)}
    >
      <FavoriteAlbumCell
        albumId={album.id}
        albumName={album.name}
        artistCaption={album.artistNames}
        collageTreatment={treatment}
        collapsed={album.id === selectedAlbumId}
        imageUrl={album.imageUrl}
        isLcpCandidate={index < COLLAGE_FIRST_SCREEN_CELLS}
      />
    </Box>
  );

  const wellIndex = selectedIndex >= 0 ? selectedIndex : sortedAlbumCards.length - 1;
  const cells = sortedAlbumCards.flatMap((albumCard, index) =>
    index === wellIndex
      ? [renderAlbum(albumCard, index), wellSlot]
      : [renderAlbum(albumCard, index)],
  );

  return (
    <>
      <CollageSortControls onSortChange={handleSortChange} sortKey={sortKey} />
      <Box className="music__albumGrid" onClickCapture={onAlbumNavigationCapture}>
        {cells}
      </Box>
    </>
  );
}
