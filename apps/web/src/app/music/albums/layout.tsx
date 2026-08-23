import 'server-only';

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GreenhouseSurface } from '../../greenhouse/GreenhouseSurface';
import { shouldUseGreenhouseChrome } from '../../layouts/greenhouseChrome';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { AlbumsGreenhousePage } from '../greenhouse/AlbumsGreenhousePage';
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
