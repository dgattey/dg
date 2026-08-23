import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { AlbumPile } from './AlbumPile';
import { greenhouseCardHeaderSx, greenhouseWellCardSx } from './greenhouseCardSx';
import type { RankedAlbum } from './types';

const pilesSx: SxObject = {
  display: { sm: 'grid', xs: 'flex' },
  gap: { md: 3, xs: 2 },
  gridTemplateColumns: {
    md: 'repeat(3, minmax(0, 1fr))',
    sm: 'repeat(2, minmax(0, 1fr))',
  },
  minWidth: 0,
  overflowX: { sm: 'visible', xs: 'auto' },
  paddingBlockEnd: { sm: 0, xs: 0.5 },
  scrollbarWidth: 'none',
  scrollSnapType: { sm: 'none', xs: 'x mandatory' },
  WebkitOverflowScrolling: 'touch',
};

const pileSx: SxObject = {
  flex: { sm: 'unset', xs: '0 0 78%' },
  minWidth: 0,
  scrollSnapAlign: { sm: 'unset', xs: 'start' },
};

const pileLinkSx: SxObject = {
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
  textDecoration: 'none',
};

type Props = {
  albums: ReadonlyArray<RankedAlbum>;
};

/**
 * One glass section card: Listening overline + “On repeat” heading, then the
 * stack row (3-up on desktop, scroll-snap on mobile). Fan-out is CSS only.
 */
export function OnRepeatCard({ albums }: Props) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <ContentCard data-greenhouse-cell="on-repeat" data-on-repeat="" sx={greenhouseWellCardSx}>
      <Box sx={greenhouseCardHeaderSx}>
        <Typography variant="overline">Listening</Typography>
        <Typography component="h3" variant="h3">
          On repeat
        </Typography>
      </Box>
      <Box sx={pilesSx}>
        {albums.map((album) => (
          <Box key={album.id} sx={pileSx}>
            <Link
              href={album.url}
              isExternal={true}
              sx={pileLinkSx}
              title={`${album.name} – ${album.artistNames}`}
            >
              <AlbumPile
                count={album.playCount}
                countKind="song"
                imageUrl={album.imageUrl}
                name={album.name}
              />
              <Box>
                <Typography variant="body1">{album.name}</Typography>
                <Typography variant="body2">{album.artistNames}</Typography>
              </Box>
            </Link>
          </Box>
        ))}
      </Box>
    </ContentCard>
  );
}
