import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { GreenhouseSurface } from '../../greenhouse/GreenhouseSurface';
import { shouldUseGreenhouseChrome } from '../../layouts/greenhouseChrome';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../layouts/PageTitle';
import { AlbumsGreenhousePage } from '../greenhouse/AlbumsGreenhousePage';
import { FavoriteAlbumsSkeleton } from './FavoriteAlbumsSkeleton';
import { FlagOffAlbumsLayout } from './FlagOffAlbumsLayout';

const TITLE = musicDestinationLabel(favoriteAlbumsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(favoriteAlbumsRoute),
  title: TITLE,
};

async function FavoriteAlbumsLayoutSwitch({ children }: { children: ReactNode }) {
  if (await shouldUseGreenhouseChrome()) {
    return <AlbumsGreenhousePage>{children}</AlbumsGreenhousePage>;
  }
  return <FlagOffAlbumsLayout>{children}</FlagOffAlbumsLayout>;
}

/**
 * Static flag-off shell. Flag cookies stay behind the boundary so
 * `/music/albums` can prerender under cacheComponents.
 */
function AlbumsLayoutFallback({ children }: { children: ReactNode }) {
  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <FavoriteAlbumsSkeleton />
      {children}
    </>
  );
}

/**
 * The grid lives in the layout so opening an album swaps only the well's
 * contents. The layout export stays synchronous; flag evaluation and
 * `GreenhouseSurface` stream in after the flag-off shell.
 */
export default function FavoriteAlbumsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AlbumsLayoutFallback>{children}</AlbumsLayoutFallback>}>
      <GreenhouseSurface surface="music">
        <FavoriteAlbumsLayoutSwitch>{children}</FavoriteAlbumsLayoutSwitch>
      </GreenhouseSurface>
    </Suspense>
  );
}
