import '../music.css';
import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Typography } from '@dg/ui/core/Typography';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { ALBUMS_BACKDROP } from '../../collage/backdrops';
import { CollageBackdrop } from '../../collage/CollageBackdrop';
import { CutLetters } from '../../collage/CutLetters';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { FavoriteAlbumsGrid } from './FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

async function AlbumsGrid() {
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

  return <FavoriteAlbumsGrid albums={albums} />;
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
export default function FavoriteAlbumsLayout({ children }: { children: ReactNode }) {
  return (
    <section aria-label={TITLE} className="collageBackdropHost music__albumsLayout">
      <CollageBackdrop backdrop={ALBUMS_BACKDROP} />
      <CutLetters className="collagePageTitle" text={TITLE} />
      <Suspense fallback={<FavoriteAlbumsSkeleton />}>
        <AlbumsGrid />
      </Suspense>
      {children}
    </section>
  );
}
