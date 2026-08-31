'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { GlassSwitcher } from '@dg/ui/core/GlassSwitcher';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { ArrowDownUp } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { PaperTag } from '../../../collage/PaperTag';
import { hasClientHydrated } from '../../../layouts/clientHydrated';
import { ALBUM_GRID_COLUMNS, albumGridSx, albumTileSlotSx } from '../albumTileGeometry';
import styles from '../music.module.css';
import { AlbumDetailBodySkeleton } from './AlbumDetailBodySkeleton';
import { AlbumWell } from './AlbumWell';
import {
  COLLAGE_ALBUM_GRID_COLUMNS,
  COLLAGE_ALBUM_SORT_OPTIONS,
  collageAlbumCardTreatment,
} from './collageAlbumCardTreatments';
import { FavoriteAlbumCell } from './FavoriteAlbumCell';
import { FavoriteAlbumsReserve } from './FavoriteAlbumsSkeleton';
import { useOptimisticAlbumSelection } from './useOptimisticAlbumSelection';

const subscribeToNothing = () => () => {};
const serverWasNotHydrated = () => false;

function viewTransitionPseudoElement(effect: AnimationEffect | null) {
  if (!effect || !('pseudoElement' in effect)) {
    return null;
  }
  const pseudo = effect.pseudoElement;
  return typeof pseudo === 'string' ? pseudo : null;
}

function waitForViewTransitionAnimations() {
  const listed = typeof document.getAnimations === 'function' ? document.getAnimations() : [];
  const animations = listed.filter((animation) =>
    Boolean(viewTransitionPseudoElement(animation.effect)?.startsWith('::view-transition')),
  );
  if (animations.length === 0) {
    return Promise.resolve();
  }
  return Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
}

function afterNextPaint() {
  if (typeof requestAnimationFrame !== 'function') {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

type AlbumSortKey = (typeof COLLAGE_ALBUM_SORT_OPTIONS)[number]['key'];

type AlbumGridColumns = Record<keyof typeof ALBUM_GRID_COLUMNS, number>;

const ALBUM_GRID_COLUMNS_BY_SURFACE = {
  classic: ALBUM_GRID_COLUMNS,
  collage: COLLAGE_ALBUM_GRID_COLUMNS,
} satisfies Record<SiteSurface, AlbumGridColumns>;

const comparators: Record<AlbumSortKey, (a: PlaylistAlbum, b: PlaylistAlbum) => number> = {
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
  album: (a, b) => a.name.localeCompare(b.name),
  artist: (a, b) => a.primaryArtist.localeCompare(b.primaryArtist) || a.name.localeCompare(b.name),
  released: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
};

function isAlbumSortKey(value: string): value is AlbumSortKey {
  return COLLAGE_ALBUM_SORT_OPTIONS.some((option) => option.key === value);
}

function albumSlotSx(index: number): SxObject {
  return { ...albumTileSlotSx, order: 2 * index + 1 };
}

/** Well order is emitted per breakpoint so SSR and client trees match. */
function wellPlacementSx(
  selectedIndex: number,
  albumCount: number,
  surface: SiteSurface,
): SxObject {
  const slotFor = (columns: number) =>
    2 * Math.min(albumCount, (Math.floor(selectedIndex / columns) + 1) * columns);
  const columns = ALBUM_GRID_COLUMNS_BY_SURFACE[surface];

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

type Props = {
  albums: Array<PlaylistAlbum>;
  /** Streamed detail for the album in the URL, rendered inside the well. */
  children?: ReactNode;
  surface?: SiteSurface;
};

export function FavoriteAlbumsGrid({ albums, children, surface = 'classic' }: Props) {
  const wasClientHydrated = useSyncExternalStore(
    subscribeToNothing,
    hasClientHydrated,
    serverWasNotHydrated,
  );
  const [showGrid, setShowGrid] = useState(!wasClientHydrated);
  useEffect(() => {
    let cancelled = false;
    void waitForViewTransitionAnimations()
      .then(afterNextPaint)
      .then(() => {
        if (!cancelled) {
          setShowGrid(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { isAwaitingDetail, onAlbumNavigationCapture, selectedAlbumId } =
    useOptimisticAlbumSelection();
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

  if (!showGrid) {
    return <FavoriteAlbumsReserve albums={albums} surface={surface} />;
  }

  const albumCards = albums.map((album, index) => ({
    album,
    treatment: collageAlbumCardTreatment(index),
  }));
  const sortedAlbumCards = albumCards.sort((a, b) => comparators[sortKey](a.album, b.album));
  const selectedIndex = selectedAlbumId
    ? sortedAlbumCards.findIndex(({ album }) => album.id === selectedAlbumId)
    : -1;
  const selectedAlbum = selectedIndex >= 0 ? sortedAlbumCards[selectedIndex]?.album : undefined;
  const well = selectedAlbum ? (
    <Box key="album-well" sx={wellPlacementSx(selectedIndex, sortedAlbumCards.length, surface)}>
      <AlbumWell album={selectedAlbum} surface={surface}>
        <Fragment key={selectedAlbum.id}>
          {isAwaitingDetail ? <AlbumDetailBodySkeleton surface={surface} /> : children}
        </Fragment>
      </AlbumWell>
    </Box>
  ) : null;

  const renderAlbum = ({ album, treatment }: (typeof sortedAlbumCards)[number], index: number) => (
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
        surface={surface}
        tooltip={`${album.name} – ${album.artistNames}`}
      />
    </Box>
  );

  const cells = sortedAlbumCards.flatMap((albumCard, index) =>
    index === selectedIndex && well
      ? [renderAlbum(albumCard, index), well]
      : [renderAlbum(albumCard, index)],
  );

  if (surface === 'collage') {
    return (
      <>
        <nav aria-label="Sort albums" className={styles.sort} {...jsOnlyProps}>
          {COLLAGE_ALBUM_SORT_OPTIONS.map((option) => {
            const current = option.key === sortKey;
            return (
              <PaperTag
                className={styles.sortTag}
                edge="quad-a"
                key={option.key}
                tiltDeg={option.tiltDeg}
                tone={current ? 'black' : 'cream'}
              >
                <button
                  aria-pressed={current}
                  className={styles.sortButton}
                  onClick={() => handleSortChange(option.key)}
                  type="button"
                >
                  {option.label}
                </button>
              </PaperTag>
            );
          })}
        </nav>
        <Box className={styles.albumGrid} onClickCapture={onAlbumNavigationCapture}>
          {cells}
        </Box>
      </>
    );
  }

  return (
    <Stack spacing={2}>
      <StickyFadeBar {...jsOnlyProps}>
        <GlassSwitcher
          aria-label="Sort albums"
          mobileIcon={<ArrowDownUp size={18} />}
          onChange={(next) => {
            if (isAlbumSortKey(next)) {
              handleSortChange(next);
            }
          }}
          options={COLLAGE_ALBUM_SORT_OPTIONS.map((option) => ({
            label: option.label,
            value: option.key,
          }))}
          value={sortKey}
        />
      </StickyFadeBar>
      <Box onClickCapture={onAlbumNavigationCapture} sx={albumGridSx}>
        {cells}
      </Box>
    </Stack>
  );
}
