import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { AlbumPile } from './AlbumPile';
import { greenhouseHeadingCardSx, greenhousePileCardSx } from './greenhouseCardSx';
import type { RankedAlbum } from './types';

const sectionSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  minWidth: 0,
  width: '100%',
};

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

const pileCardSx: SxObject = {
  ...greenhousePileCardSx,
  flex: { sm: 'unset', xs: '0 0 78%' },
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
 * Three fanned album piles on desktop, two on tablet, a scroll-snap row on
 * mobile. Each pile sits on intro-token glass so the caption stays readable.
 * Fan-out is CSS only.
 */
export function OnRepeatCard({ albums }: Props) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <Box data-on-repeat="" sx={sectionSx}>
      <ContentCard data-greenhouse-cell="on-repeat-heading" sx={greenhouseHeadingCardSx}>
        <Typography variant="overline">On repeat</Typography>
      </ContentCard>
      <Box sx={pilesSx}>
        {albums.map((album) => (
          <ContentCard data-greenhouse-cell="on-repeat-pile" key={album.id} sx={pileCardSx}>
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
                <Typography component="h5" variant="h5">
                  {album.name}
                </Typography>
                <Typography variant="caption">{album.artistNames}</Typography>
              </Box>
            </Link>
          </ContentCard>
        ))}
      </Box>
    </Box>
  );
}
