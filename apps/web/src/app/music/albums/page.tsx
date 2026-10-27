import 'server-only';
import '../music.css';
import '../../collage/pills.css';

import { ALBUM_PARAM, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAlbumDetail, getFavoriteAlbums } from '../../../services/albums';
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

type FavoriteAlbumsPageProps = {
  searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
};

async function AlbumsGrid({ searchParams }: FavoriteAlbumsPageProps) {
  const [albums, params] = await Promise.all([getFavoriteAlbums(), searchParams]);

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

  const selectedAlbumId = albums.find(({ id }) => id === params?.[ALBUM_PARAM])?.id;
  return (
    <FavoriteAlbumsGrid
      albums={albums}
      initialAlbumId={selectedAlbumId}
      initialDetail={selectedAlbumId ? getAlbumDetail(selectedAlbumId) : undefined}
    />
  );
}

/**
 * Keep this sync — `searchParams` is awaited only inside the Suspense boundary
 * so the shell can prerender.
 */
export default function FavoriteAlbumsPage({ searchParams }: FavoriteAlbumsPageProps) {
  return (
    <MusicPageShell
      backdrop={ALBUMS_BACKDROP}
      className="music__albumsLayout"
      navFrom={favoriteAlbumsRoute}
      title={TITLE}
    >
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid searchParams={searchParams} />
      </Suspense>
    </MusicPageShell>
  );
}
