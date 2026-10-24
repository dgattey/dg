import 'server-only';
import '../music.css';
import '../../collage/pills.css';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
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
  description: 'All-time favorite albums on Spotify.',
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

export default function FavoriteAlbumsPage() {
  return (
    <MusicPageShell
      backdrop={ALBUMS_BACKDROP}
      className="music__albumsLayout"
      navFrom={favoriteAlbumsRoute}
      title={TITLE}
    >
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid />
      </Suspense>
    </MusicPageShell>
  );
}
