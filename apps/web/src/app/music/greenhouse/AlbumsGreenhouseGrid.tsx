'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { FavoriteAlbumsGrid } from '../albums/FavoriteAlbumsGrid';
import { GREENHOUSE_ALBUM_COLUMNS, greenhouseWellCardSx } from './greenhouseCardSx';

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
 * Favorite albums in one greenhouse card: sort chips, then stacked covers.
 * Same `FavoriteAlbumsGrid` data and interactions as flag-off; the sticky
 * fade bar stays off so it cannot paint the layout cream header mask.
 */
export function AlbumsGreenhouseGrid({ albums, children }: Props) {
  return (
    <Box data-albums-greenhouse="" sx={columnSx}>
      <ContentCard data-greenhouse-cell="albums-grid" sx={greenhouseWellCardSx}>
        <FavoriteAlbumsGrid
          albums={[...albums]}
          columns={GREENHOUSE_ALBUM_COLUMNS}
          stickyToolbar={false}
        >
          {children}
        </FavoriteAlbumsGrid>
      </ContentCard>
    </Box>
  );
}
