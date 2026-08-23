'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { FavoriteAlbumsGrid } from '../albums/FavoriteAlbumsGrid';
import {
  GREENHOUSE_ALBUM_COLUMNS,
  greenhouseToolbarCardSx,
  greenhouseWellCardSx,
} from './greenhouseCardSx';

type Props = {
  albums: ReadonlyArray<PlaylistAlbum>;
  children?: ReactNode;
};

const columnSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  marginInline: 'auto',
  maxWidth: '68rem',
  minWidth: 0,
  width: '100%',
};

/**
 * Favorite albums in the greenhouse column: glass sort toolbar + glass grid
 * of stacked covers. Same `FavoriteAlbumsGrid` data and interactions as
 * flag-off; the 100vw fade bar is stripped by the card tokens.
 */
export function AlbumsGreenhouseGrid({ albums, children }: Props) {
  return (
    <Box data-albums-greenhouse="" sx={columnSx}>
      <FavoriteAlbumsGrid
        albums={[...albums]}
        columns={GREENHOUSE_ALBUM_COLUMNS}
        renderGrid={(grid) => (
          <ContentCard data-greenhouse-cell="albums-grid" sx={greenhouseWellCardSx}>
            {grid}
          </ContentCard>
        )}
        renderToolbar={(toolbar) => (
          <ContentCard data-greenhouse-cell="albums-toolbar" sx={greenhouseToolbarCardSx}>
            {toolbar}
          </ContentCard>
        )}
      >
        {children}
      </FavoriteAlbumsGrid>
    </Box>
  );
}
