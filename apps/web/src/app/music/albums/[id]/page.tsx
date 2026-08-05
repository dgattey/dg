import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Typography } from '@mui/material';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getAlbumDetail } from '../../../../services/albumDetail';
import { getFavoriteAlbums } from '../../../../services/albums';
import { musicDestinationLabel } from '../../../layouts/musicFooterDestinations';
import { PageTitle } from '../../../layouts/PageTitle';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from '../FavoriteAlbumsSkeleton';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAlbumDetail(id);
  if (!detail) {
    return { title: TITLE };
  }
  const artists = detail.artists.map((artist) => artist.name).join(', ');
  return {
    description: `${detail.name} by ${artists}`,
    title: `${detail.name} · ${TITLE}`,
  };
}

async function AlbumDetailContent({ albumId }: { albumId: string }) {
  const [albums, detail] = await Promise.all([getFavoriteAlbums(), getAlbumDetail(albumId)]);

  // Missing Spotify token: both degrade to null — same empty state as the list.
  if (albums === null && detail === null) {
    return <Typography color="text.secondary">No albums right now. Check back soon.</Typography>;
  }

  if (!detail) {
    notFound();
  }

  return (
    <FavoriteAlbumsGrid albumDetail={detail} albums={albums ?? []} selectedAlbumId={albumId} />
  );
}

/**
 * Favorite albums with an inline well for one album. Shell stays sync so the
 * view transition can photograph the outgoing grid art before detail streams.
 */
export default async function AlbumDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumDetailContent albumId={id} />
      </Suspense>
    </>
  );
}
