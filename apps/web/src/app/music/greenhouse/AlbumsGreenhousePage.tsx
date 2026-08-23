import 'server-only';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { AlbumsGreenhouseGrid } from './AlbumsGreenhouseGrid';
import { greenhouseHeadingCardSx } from './greenhouseCardSx';
import { ListeningHeading } from './ListeningHeading';

const ALBUMS_DESCRIPTION = 'Saved records, stacked so they fan on hover.';

function AlbumsStatus({ children }: { children: ReactNode }) {
  return (
    <ContentCard data-greenhouse-cell="albums-status" sx={greenhouseHeadingCardSx}>
      <Typography color="text.secondary" variant="body1">
        {children}
      </Typography>
    </ContentCard>
  );
}

async function AlbumsGreenhouseSlots({
  children,
  fixture,
}: {
  children?: ReactNode;
  fixture?: ReadonlyArray<PlaylistAlbum>;
}) {
  const albums = fixture ?? (await getFavoriteAlbums().catch(() => null));

  if (albums === null) {
    return (
      <AlbumsStatus>
        Favorite albums are temporarily unavailable. Please try again soon.
      </AlbumsStatus>
    );
  }
  if (albums.length === 0) {
    return <AlbumsStatus>No favorite albums yet.</AlbumsStatus>;
  }

  return <AlbumsGreenhouseGrid albums={albums}>{children}</AlbumsGreenhouseGrid>;
}

/**
 * Flag-on `/music/albums`. Heading is glass; the grid is the same sortable
 * well-backed favorite list as flag-off so album open/close stays intact.
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
      <ListeningHeading cell="albums-heading" description={ALBUMS_DESCRIPTION} title="Albums" />
      <Suspense fallback={null}>
        <AlbumsGreenhouseSlots fixture={fixture}>{children}</AlbumsGreenhouseSlots>
      </Suspense>
    </GreenhouseTypeProvider>
  );
}
