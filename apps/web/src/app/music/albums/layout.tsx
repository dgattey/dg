import 'server-only';
import '../music.css';
import '../../collage/pills.css';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { ALBUMS_BACKDROP } from '../../collage/backdrops';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationTitle } from '../../layouts/musicHeaderDestinations';
import { CollageMusicStatus } from '../MusicHistorySections';
import { MusicPageShell } from '../MusicPageShell';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicDestinationTitle(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

async function AlbumsGrid() {
  const albums = await getFavoriteAlbums();

  if (albums === null) {
    return (
      <CollageMusicStatus>
        <p>Favorite albums are temporarily unavailable. Please try again soon.</p>
      </CollageMusicStatus>
    );
  }
  if (albums.length === 0) {
    return (
      <CollageMusicStatus>
        <p>No favorite albums yet.</p>
      </CollageMusicStatus>
    );
  }

  return <FavoriteAlbumsGrid albums={albums} />;
}

/**
 * The grid lives in the layout so opening an album swaps only the well's
 * contents. Were it in the pages instead, navigating to an album would unmount
 * and refetch the whole grid, and the art would have nothing to morph out of.
 */
export default function FavoriteAlbumsLayout({ children }: { children: ReactNode }) {
  return (
    <MusicPageShell backdrop={ALBUMS_BACKDROP} className="music__albumsLayout" title={TITLE}>
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid />
      </Suspense>
      {children}
    </MusicPageShell>
  );
}
