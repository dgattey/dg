import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Typography } from '@mui/material';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../../services/albums';
import { CutLetters } from '../../../collage/CutLetters';
import { markdownAlternates } from '../../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../../layouts/PageTitle';
import styles from '../music.module.css';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

async function AlbumsGrid({
  children,
  surface = 'classic',
}: {
  children: ReactNode;
  surface?: SiteSurface;
}) {
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

  return (
    <FavoriteAlbumsGrid albums={albums} surface={surface}>
      {children}
    </FavoriteAlbumsGrid>
  );
}

/**
 * The grid lives in the layout so opening an album swaps only the well's
 * contents. Were it in the pages instead, navigating to an album would unmount
 * and refetch the whole grid, and the art would have nothing to morph out of.
 *
 * Shell stays synchronous so it commits in the same render as the outgoing
 * page; awaiting here would suspend the route and leave the transition with no
 * old snapshot to animate away from.
 */
export default function FavoriteAlbumsLayout({
  children,
  surface = 'classic',
}: {
  children: ReactNode;
  surface?: SiteSurface;
}) {
  if (surface === 'collage') {
    return (
      <section aria-label={TITLE} className={styles.albumsLayout}>
        <CutLetters className="collagePageTitle" text={TITLE} />
        <Suspense fallback={<FavoriteAlbumsSkeleton surface="collage" />}>
          <AlbumsGrid surface="collage">{children}</AlbumsGrid>
        </Suspense>
      </section>
    );
  }

  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid>{children}</AlbumsGrid>
      </Suspense>
    </>
  );
}
