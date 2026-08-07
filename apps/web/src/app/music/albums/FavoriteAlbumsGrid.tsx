'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { GlassSwitcher } from '@dg/ui/core/GlassSwitcher';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { ArrowDownUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { ALBUM_GRID_COLUMNS, albumGridSx, albumTileSlotSx } from '../albumTileGeometry';
import { AlbumDetailBodySkeleton } from './AlbumDetailBodySkeleton';
import { AlbumWell } from './AlbumWell';
import { FavoriteAlbumCell } from './FavoriteAlbumCell';
import { useOptimisticAlbumSelection } from './useOptimisticAlbumSelection';

const SORT_OPTIONS = [
  { key: 'added', label: 'Recently added' },
  { key: 'album', label: 'Album' },
  { key: 'artist', label: 'Artist' },
  { key: 'released', label: 'Release date' },
] as const;

type AlbumSortKey = (typeof SORT_OPTIONS)[number]['key'];

const comparators: Record<AlbumSortKey, (a: PlaylistAlbum, b: PlaylistAlbum) => number> = {
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
  album: (a, b) => a.name.localeCompare(b.name),
  artist: (a, b) => a.primaryArtist.localeCompare(b.primaryArtist) || a.name.localeCompare(b.name),
  released: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
};

/** A cell's slot in the grid, stretched around it and ordered ahead of a well. */
function albumSlotSx(index: number): SxObject {
  return {
    ...albumTileSlotSx,
    order: 2 * index + 1,
  };
}

/**
 * Albums claim the odd visual slots (album `i` gets `order: 2i + 1`), which
 * leaves every even slot free for the well. The well belongs at the end of the
 * selected album's row, and only CSS knows how many columns that row has, so
 * its slot is emitted once per breakpoint rather than measured in JS —
 * measuring would render a different tree on the server than on the client.
 */
function wellPlacementSx(selectedIndex: number, albumCount: number): SxObject {
  const slotFor = (columns: number) =>
    2 * Math.min(albumCount, (Math.floor(selectedIndex / columns) + 1) * columns);

  return {
    gridColumn: '1 / -1',
    order: {
      lg: slotFor(ALBUM_GRID_COLUMNS.lg),
      md: slotFor(ALBUM_GRID_COLUMNS.md),
      sm: slotFor(ALBUM_GRID_COLUMNS.sm),
      xs: slotFor(ALBUM_GRID_COLUMNS.xs),
    },
  };
}

type Props = {
  albums: Array<PlaylistAlbum>;
  /** Streamed detail for the album in the URL, rendered inside the well. */
  children?: ReactNode;
};

/**
 * Sortable grid of favorite album covers. When the URL names an album, a
 * content-width well is inserted after that album's row; the selected cell
 * stays put as a collapsed placeholder while art morphs into the well.
 *
 * The selection is read from the query rather than passed in, so this grid can
 * live in the layout — where a query change never refetches it — and stay
 * mounted across open and close. Clicks run ahead of the query so the well
 * opens on the click instead of on the payload that click goes and fetches.
 */
export function FavoriteAlbumsGrid({ albums, children }: Props) {
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

  // No dependency array: runs after every render but only animates when a
  // sort change just captured the previous item positions.
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

  const sortedAlbums = [...albums].sort(comparators[sortKey]);
  const selectedIndex = selectedAlbumId
    ? sortedAlbums.findIndex((album) => album.id === selectedAlbumId)
    : -1;
  const selectedAlbum = selectedIndex >= 0 ? sortedAlbums[selectedIndex] : undefined;
  const well = selectedAlbum ? (
    <Box key="album-well" sx={wellPlacementSx(selectedIndex, sortedAlbums.length)}>
      <AlbumWell album={selectedAlbum}>
        {/*
         * Streamed detail always belongs to the album in the URL, so it is only
         * rendered once the URL agrees with what the well is showing; until then
         * the well holds the same skeleton the page streams behind. Keying by
         * album makes that the single swap and stops one album's tracklist from
         * lingering inside another album's well.
         */}
        <Fragment key={selectedAlbum.id}>
          {isAwaitingDetail ? <AlbumDetailBodySkeleton /> : children}
        </Fragment>
      </AlbumWell>
    </Box>
  ) : null;

  const renderAlbum = (album: PlaylistAlbum, index: number) => (
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
        collapsed={album.id === selectedAlbumId}
        imageUrl={album.imageUrl}
        tooltip={`${album.name} – ${album.artistNames}`}
      />
    </Box>
  );

  // The well sits next to its album in the DOM for reading and tab order; CSS
  // `order` is what floats it down to the end of that album's row.
  const cells = sortedAlbums.flatMap((album, index) =>
    index === selectedIndex && well
      ? [renderAlbum(album, index), well]
      : [renderAlbum(album, index)],
  );

  return (
    <Stack spacing={2}>
      <StickyFadeBar>
        <GlassSwitcher
          aria-label="Sort albums"
          mobileIcon={<ArrowDownUp size={18} />}
          onChange={(next) => handleSortChange(next as AlbumSortKey)}
          options={SORT_OPTIONS.map((option) => ({ label: option.label, value: option.key }))}
          value={sortKey}
        />
      </StickyFadeBar>
      <Box onClickCapture={onAlbumNavigationCapture} sx={albumGridSx}>
        {cells}
      </Box>
    </Stack>
  );
}
