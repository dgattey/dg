'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { ALBUM_PARAM, albumAnchorId, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { albumTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { EASING_DEFAULT, TIMING_MEDIUM, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent } from 'react';
import {
  addTransitionType,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { collageCardTreatment } from '../../collage/collageCardTreatment';
import { albumDetailFor } from './albumDetailCache';
import {
  type AlbumSortKey,
  COLLAGE_ALBUM_GRID_COLUMNS,
  CollageSortControls,
  DEFAULT_ALBUM_SORT,
} from './collageAlbumCardTreatments';
import { FavoriteAlbumCell } from './FavoriteAlbumCell';
import { type AlbumCard, SelectedAlbumWell } from './SelectedAlbumWell';
import { useNearbyAlbumPrefetch } from './useNearbyAlbumPrefetch';

const COLLAGE_FIRST_SCREEN_CELLS = COLLAGE_ALBUM_GRID_COLUMNS.xs * 2;

const comparators: Record<AlbumSortKey, (a: PlaylistAlbum, b: PlaylistAlbum) => number> = {
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
  album: (a, b) => a.name.localeCompare(b.name),
  artist: (a, b) => a.primaryArtist.localeCompare(b.primaryArtist) || a.name.localeCompare(b.name),
  released: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
};

function readUrlAlbumId(): string | null {
  return new URLSearchParams(window.location.search).get(ALBUM_PARAM);
}

function isPlainNavigationClick(event: MouseEvent<HTMLElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function albumsRouteAnchor(event: { target: EventTarget | null }) {
  const anchor = event.target instanceof Element ? event.target.closest('a') : null;
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return null;
  }
  const destination = new URL(anchor.href, window.location.href);
  return destination.origin === window.location.origin &&
    destination.pathname === favoriteAlbumsRoute
    ? destination
    : null;
}

/** Where every cell sat before a change, kept until the commit that shows that change. */
type PendingSlide = {
  /** Held where it was clicked, even when a well above it closes. */
  anchorAlbumId: string | null;
  duration: number;
  offsets: Map<string, { left: number; top: number }>;
  selectedAlbumId: string | null;
  sortKey: AlbumSortKey;
};

type Props = {
  albums: Array<PlaylistAlbum>;
  /** The album `?album=` opened on the server. */
  initialAlbumId?: string;
  /** Its detail, still streaming from the server. */
  initialDetail?: Promise<AlbumDetail | null | undefined>;
};

export function FavoriteAlbumsGrid({ albums, initialAlbumId, initialDetail }: Props) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(initialAlbumId ?? null);
  /** Changes only when the well moves rows, so switching within a row keeps the one well. */
  const [wellAlbumId, setWellAlbumId] = useState(initialAlbumId ?? null);
  const [sortKey, setSortKey] = useState<AlbumSortKey>(DEFAULT_ALBUM_SORT);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const wellRef = useRef<HTMLDivElement>(null);
  const pendingSlide = useRef<PendingSlide | null>(null);
  const landOnWell = useRef(initialAlbumId !== undefined);
  useNearbyAlbumPrefetch(itemRefs);

  useEffect(() => {
    const syncFromUrl = () => {
      startTransition(() => {
        setSelectedAlbumId(readUrlAlbumId());
      });
    };
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

  useEffect(() => {
    if (selectedAlbumId && landOnWell.current && wellRef.current) {
      landOnWell.current = false;
      wellRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [selectedAlbumId]);

  const slideCellsInto = (next: Omit<PendingSlide, 'offsets'>) => {
    pendingSlide.current = {
      ...next,
      offsets: new Map(
        [...itemRefs.current].map(([id, element]) => [id, element.getBoundingClientRect()]),
      ),
    };
  };

  const prefetchAlbumFor = (
    event: FocusEvent<HTMLElement> | PointerEvent<HTMLElement>,
    { retryFailed = false } = {},
  ) => {
    const nextAlbumId = albumsRouteAnchor(event)?.searchParams.get(ALBUM_PARAM);
    if (nextAlbumId) {
      void albumDetailFor(nextAlbumId, { retryFailed });
    }
  };

  const onAlbumNavigationCapture = (event: MouseEvent<HTMLElement>) => {
    if (!isPlainNavigationClick(event)) {
      return;
    }
    const destination = albumsRouteAnchor(event);
    if (!destination) {
      return;
    }
    const nextAlbumId = destination.searchParams.get(ALBUM_PARAM);
    if (nextAlbumId === selectedAlbumId) {
      return;
    }
    event.preventDefault();
    if (nextAlbumId) {
      void albumDetailFor(nextAlbumId, { retryFailed: true });
    }
    const types = albumTransitionTypes(nextAlbumId ? 'open' : 'close');
    const rowTop = (albumId: string) => itemRefs.current.get(albumId)?.getBoundingClientRect().top;
    const staysInRow =
      selectedAlbumId !== null &&
      nextAlbumId !== null &&
      rowTop(selectedAlbumId) === rowTop(nextAlbumId);
    window.history.pushState(null, '', `${destination.pathname}${destination.search}`);
    // Matches the album well's view transition, so the cells below move with the well.
    slideCellsInto({
      anchorAlbumId: nextAlbumId,
      duration: TIMING_MEDIUM,
      selectedAlbumId: nextAlbumId,
      sortKey,
    });
    startTransition(() => {
      for (const type of types) {
        addTransitionType(type);
      }
      setSelectedAlbumId(nextAlbumId);
      if (!staysInRow) {
        setWellAlbumId(nextAlbumId);
      }
    });
  };

  const handleSortChange = (next: AlbumSortKey) => {
    if (next === sortKey) {
      return;
    }
    slideCellsInto({ anchorAlbumId: null, duration: TIMING_SLOW, selectedAlbumId, sortKey: next });
    setSortKey(next);
  };

  useLayoutEffect(() => {
    const previous = pendingSlide.current;
    if (!previous || previous.selectedAlbumId !== selectedAlbumId || previous.sortKey !== sortKey) {
      return;
    }
    pendingSlide.current = null;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Switching to an album below the open well closes that well above it. Scrolling by the
    // distance that removes keeps the clicked album where it was clicked, with its well below it.
    const { anchorAlbumId } = previous;
    const anchorBefore = anchorAlbumId ? previous.offsets.get(anchorAlbumId) : undefined;
    const anchor = anchorAlbumId ? itemRefs.current.get(anchorAlbumId) : undefined;
    const anchorTravel =
      anchor && anchorBefore ? anchor.getBoundingClientRect().top - anchorBefore.top : 0;
    if (anchorTravel !== 0) {
      window.scrollBy({ behavior: 'instant', top: anchorTravel });
    }
    const maxTravel = (window.innerHeight || 900) + 240;
    const moves: Array<{ deltaX: number; deltaY: number; element: HTMLElement }> = [];
    for (const [id, element] of itemRefs.current) {
      const before = previous.offsets.get(id);
      if (!before || typeof element.animate !== 'function') {
        continue;
      }
      const after = element.getBoundingClientRect();
      if (before.top > maxTravel && after.top > maxTravel) {
        continue;
      }
      const deltaX = before.left - after.left;
      const rawDeltaY = before.top - after.top;
      const deltaY = Math.max(-maxTravel, Math.min(maxTravel, rawDeltaY));
      if (deltaX === 0 && deltaY === 0) {
        continue;
      }
      moves.push({ deltaX, deltaY, element });
    }
    const slides = moves.map(({ deltaX, deltaY, element }) =>
      element.animate(
        [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
        { duration: previous.duration, easing: EASING_DEFAULT },
      ),
    );
    // The view transition's own animations only start once its new snapshot is captured, a
    // frame or more after this commit. Holding the cells on their first frame until then keeps
    // them level with the well instead of opening a gap to the backdrop.
    const viewTransition = document.activeViewTransition;
    if (viewTransition) {
      for (const slide of slides) {
        slide.pause();
      }
      void viewTransition.ready
        .catch(() => undefined)
        .then(() => {
          for (const slide of slides) {
            slide.play();
          }
        });
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
    <SelectedAlbumWell
      albumCount={sortedAlbumCards.length}
      initialDetail={selectedAlbumId === initialAlbumId ? initialDetail : undefined}
      key={`album-well-${wellAlbumId}`}
      selectedCard={sortedAlbumCards[selectedIndex]}
      selectedIndex={selectedIndex}
      wellRef={wellRef}
    />
  );

  const renderAlbum = ({ album, treatment }: AlbumCard, index: number) => (
    <div
      className="music__albumSlot"
      id={albumAnchorId(album.id)}
      key={album.id}
      ref={(element: HTMLElement | null) => {
        if (element) {
          itemRefs.current.set(album.id, element);
        } else {
          itemRefs.current.delete(album.id);
        }
      }}
      style={{ '--slot-order': 2 * index + 1 } as CSSProperties}
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
    </div>
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
      <div
        className="music__albumGrid"
        onClickCapture={onAlbumNavigationCapture}
        onFocusCapture={(event) => prefetchAlbumFor(event)}
        onPointerDownCapture={(event) => prefetchAlbumFor(event, { retryFailed: true })}
        onPointerOverCapture={(event) => prefetchAlbumFor(event)}
      >
        {cells}
      </div>
    </>
  );
}
