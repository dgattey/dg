import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { albumRoute } from '@dg/shared-core/routes/app';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { AlbumPile } from './AlbumPile';
import { greenhouseCardSx } from './greenhouseCardSx';

const gridSx: SxObject = {
  display: 'grid',
  gap: { md: 2.5, xs: 2 },
  gridTemplateColumns: {
    md: 'repeat(3, minmax(0, 1fr))',
    sm: 'repeat(2, minmax(0, 1fr))',
    xs: '1fr',
  },
  width: '100%',
};

const cellLinkSx: SxObject = {
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
  minWidth: 0,
  textDecoration: 'none',
};

type Props = {
  albums: ReadonlyArray<PlaylistAlbum>;
  children?: ReactNode;
};

/**
 * Favorite albums as glass cells. Each cell is a fanned pile; the streamed
 * album well (children) sits under the grid when a record is open.
 */
export function AlbumsGreenhouseGrid({ albums, children }: Props) {
  return (
    <Box data-albums-greenhouse="" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={gridSx}>
        {albums.map((album) => (
          <ContentCard key={album.id} sx={greenhouseCardSx}>
            <Link href={albumRoute(album.id)} sx={cellLinkSx} title={album.name}>
              <AlbumPile imageUrl={album.imageUrl} name={album.name} />
              <Box>
                <Typography component="h5" variant="h5">
                  {album.name}
                </Typography>
                <Typography variant="caption">{album.artistNames}</Typography>
              </Box>
            </Link>
          </ContentCard>
        ))}
      </Box>
      {children}
    </Box>
  );
}
