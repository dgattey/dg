import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Typography } from '@mui/material';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { GreenhouseSurface } from '../../greenhouse/GreenhouseSurface';
import { shouldUseGreenhouseChrome } from '../../layouts/greenhouseChrome';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../layouts/PageTitle';
import { AlbumsGreenhousePage } from '../greenhouse/AlbumsGreenhousePage';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

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
 * Flag-off albums shell. The title stays in this tree so it survives album
 * navigations and the layout test can still find it.
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

async function FavoriteAlbumsLayoutSwitch({ children }: { children: ReactNode }) {
  if (await shouldUseGreenhouseChrome()) {
    return (
      <AlbumsGreenhousePage>
        <FlagOffAlbumsLayout>{children}</FlagOffAlbumsLayout>
      </AlbumsGreenhousePage>
    );
  }
  return <FlagOffAlbumsLayout>{children}</FlagOffAlbumsLayout>;
}

/**
 * The grid lives in the layout so opening an album swaps only the well's
 * contents. Were it in the pages instead, navigating to an album would unmount
 * and refetch the whole grid, and the art would have nothing to morph out of.
 *
 * Shell stays synchronous so it commits in the same render as the outgoing
 * page; the flag check lives in a child. Chrome wrap is `GreenhouseSurface`.
 */
export default function FavoriteAlbumsLayout({ children }: { children: ReactNode }) {
  return (
    <GreenhouseSurface surface="music">
      <FavoriteAlbumsLayoutSwitch>{children}</FavoriteAlbumsLayoutSwitch>
    </GreenhouseSurface>
  );
}
