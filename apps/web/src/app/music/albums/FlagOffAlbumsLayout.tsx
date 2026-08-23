import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../layouts/PageTitle';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

async function AlbumsGrid({ children }: { children: ReactNode }) {
  const albums = await getFavoriteAlbums();

  if (albums === null) {
    return (
      <Typography color="text.secondary">
        Favorite albums are temporarily unavailable. Please try again soon.
      </Typography>
    );
  }
  if (albums.length === 0) {
    return <Typography color="text.secondary">No favorite albums yet.</Typography>;
  }

  return <FavoriteAlbumsGrid albums={albums}>{children}</FavoriteAlbumsGrid>;
}

/**
 * Flag-off albums shell. Isolated so Jest can import it without the greenhouse
 * CSS-module graph.
 */
export function FlagOffAlbumsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid>{children}</AlbumsGrid>
      </Suspense>
    </>
  );
}
