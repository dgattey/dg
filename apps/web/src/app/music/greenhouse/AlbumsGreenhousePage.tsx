import 'server-only';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { AlbumsGreenhouseGrid } from './AlbumsGreenhouseGrid';
import { ListeningHeading } from './ListeningHeading';

const ALBUMS_DESCRIPTION = 'Saved records, stacked so they fan on hover.';

async function AlbumsGreenhouseSlots({
  children,
  fixture,
}: {
  children?: ReactNode;
  fixture?: ReadonlyArray<PlaylistAlbum>;
}) {
  const albums = fixture ?? (await getFavoriteAlbums().catch(() => null)) ?? [];

  if (albums.length === 0) {
    return <Typography variant="body2">No favorite albums yet.</Typography>;
  }

  return <AlbumsGreenhouseGrid albums={albums}>{children}</AlbumsGreenhouseGrid>;
}

/**
 * Flag-on `/music/albums`. Owns its own fixture-backed grid so a missing
 * Spotify token does not fall through to the flag-off unavailable copy.
 */
export function AlbumsGreenhousePage({
  children,
  fixture,
}: {
  children?: ReactNode;
  fixture?: ReadonlyArray<PlaylistAlbum>;
}) {
  return (
    <GreenhouseTypeProvider>
      <ListeningHeading description={ALBUMS_DESCRIPTION} title="Albums" />
      <Suspense fallback={null}>
        <AlbumsGreenhouseSlots fixture={fixture}>{children}</AlbumsGreenhouseSlots>
      </Suspense>
    </GreenhouseTypeProvider>
  );
}
