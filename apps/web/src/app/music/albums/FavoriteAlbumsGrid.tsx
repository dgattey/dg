'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { GlassSwitcher } from '@dg/ui/core/GlassSwitcher';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { ArrowDownUp } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { AlbumThumbnail } from '../../spotify/AlbumThumbnail';

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

const gridSx: SxObject = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: 'repeat(6, 1fr)',
    md: 'repeat(4, 1fr)',
    sm: 'repeat(3, 1fr)',
    xs: 'repeat(2, 1fr)',
  },
};

type Props = {
  albums: Array<PlaylistAlbum>;
};

/**
 * Sortable grid of favorite album covers. Reordering runs a FLIP animation:
 * item positions are captured before the sort is applied, then each moved
 * item plays from its old position to its new one.
 */
export function FavoriteAlbumsGrid({ albums }: Props) {
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
      <Box sx={gridSx}>
        {sortedAlbums.map((album) => (
          <Box
            key={album.id}
            ref={(element: HTMLElement | null) => {
              if (element) {
                itemRefs.current.set(album.id, element);
              } else {
                itemRefs.current.delete(album.id);
              }
            }}
          >
            <AlbumThumbnail
              albumName={album.name}
              imageUrl={album.imageUrl}
              linkUrl={album.url}
              tooltip={`${album.name} – ${album.artistNames}`}
            />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
