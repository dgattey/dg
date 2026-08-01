import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getFavoriteAlbums } from '../../../services/albums';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: 'Favorite albums',
};

export default async function FavoriteAlbumsPage() {
  let albums: Awaited<ReturnType<typeof getFavoriteAlbums>>;

  try {
    albums = await getFavoriteAlbums();
  } catch (error) {
    // In development, redirect to the dev page to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }

  return (
    <main>
      <Stack spacing={2}>
        <Typography variant="h1">Favorite albums</Typography>
        <FavoriteAlbumsGrid albums={albums} />
      </Stack>
    </main>
  );
}
