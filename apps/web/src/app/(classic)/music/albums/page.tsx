import 'server-only';

import { ALBUM_PARAM } from '@dg/shared-core/routes/app';
import { Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getAlbumDetail } from '../../../../services/albumDetail';
import { AlbumDetailBody } from './AlbumDetailBody';
import { AlbumDetailBodySkeleton } from './AlbumDetailBodySkeleton';

type PageProps = {
  searchParams: Promise<Record<string, string | Array<string> | undefined>>;
};

async function SelectedAlbum({ searchParams }: PageProps) {
  const albumId = (await searchParams)[ALBUM_PARAM];

  if (typeof albumId !== 'string' || !albumId) {
    return null;
  }

  const detail = await getAlbumDetail(albumId);

  if (detail === null) {
    notFound();
  }
  if (detail === undefined) {
    return (
      <Typography color="text.secondary">
        Album details are temporarily unavailable. Please try again soon.
      </Typography>
    );
  }

  return <AlbumDetailBody album={detail} />;
}

/**
 * Fills the well slot the albums layout leaves inside the grid. Only the part
 * that needs a fetch lives here — the layout already renders the well frame,
 * art, and title, so the shared art name is on screen before this resolves and
 * the morph has somewhere to land.
 *
 * Shell stays synchronous so `searchParams` is awaited inside the boundary
 * rather than blocking the route's static shell.
 */
export default function FavoriteAlbumsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AlbumDetailBodySkeleton />}>
      <SelectedAlbum searchParams={searchParams} />
    </Suspense>
  );
}
