import 'server-only';

import { favoriteAlbumsRoute, homeRoute } from '@dg/shared-core/routes/app';
import { Sheet } from '@dg/ui/core/sheet/Sheet';
import { Typography } from '@mui/material';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicSheetLabel } from '../../layouts/musicFooterDestinations';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicSheetLabel(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

async function FavoriteAlbums() {
  const albums = await getFavoriteAlbums();

  if (!albums?.length) {
    return <Typography color="text.secondary">No albums right now. Check back soon.</Typography>;
  }

  return <FavoriteAlbumsGrid albums={albums} />;
}

/**
 * The sheet shell stays synchronous so it commits in the same render as the
 * outgoing page. Awaiting here instead would suspend the whole route, the old
 * page would already be unmounted by the time the sheet arrives, and the view
 * transition would have nothing to animate away from.
 */
export default function FavoriteAlbumsPage() {
  return (
    <Sheet closeHref={homeRoute} title={TITLE}>
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <FavoriteAlbums />
      </Suspense>
    </Sheet>
  );
}
