import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { FavoriteAlbumsGrid } from '../albums/FavoriteAlbumsGrid';

type Props = {
  albums: ReadonlyArray<PlaylistAlbum>;
  children?: ReactNode;
};

/**
 * Favorite albums with the flag-off grid: sort, hover fan, in-row well,
 * collapsed socket, and view transitions. Greenhouse chrome is the heading
 * card and this copy-well wrapper.
 */
export function AlbumsGreenhouseGrid({ albums, children }: Props) {
  return (
    <Box data-albums-greenhouse="" data-greenhouse-cell="albums-grid">
      <FavoriteAlbumsGrid albums={[...albums]}>{children}</FavoriteAlbumsGrid>
    </Box>
  );
}
