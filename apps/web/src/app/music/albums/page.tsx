import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { getFavoriteAlbums } from '../../../services/albums';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: 'Favorite albums',
};

export default async function FavoriteAlbumsPage() {
  const albums = await getFavoriteAlbums();

  return (
    <main>
      <Stack spacing={2}>
        <Typography variant="h1">Favorite albums</Typography>
        {albums?.length ? (
          <FavoriteAlbumsGrid albums={albums} />
        ) : (
          <Typography color="text.secondary">No albums right now. Check back soon.</Typography>
        )}
      </Stack>
    </main>
  );
}
