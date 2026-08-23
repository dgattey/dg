import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { AlbumCover } from '../AlbumCover';
import { AlbumStack } from '../AlbumStack';
import { MAX_ALBUM_SLEEVES } from '../albumTileGeometry';
import {
  GREENHOUSE_STACK_ART_SIZE,
  GREENHOUSE_STACK_ART_SIZES,
  greenhouseCardHeaderSx,
  greenhouseCardSx,
} from './greenhouseCardSx';
import type { RankedAlbum } from './types';

const stacksSx: SxObject = {
  '@container (min-width: 28rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  containerType: 'inline-size',
  display: 'grid',
  gap: 1.5,
  gridTemplateColumns: '1fr',
};

const stackLinkSx: SxObject = {
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  minWidth: 0,
  textDecoration: 'none',
};

type Props = {
  albums: ReadonlyArray<RankedAlbum>;
};

function playLabel(playCount: number) {
  if (playCount <= 0) {
    return 'Favorite';
  }
  return `${playCount} ${playCount === 1 ? 'play' : 'plays'}`;
}

/**
 * Fanned album stacks inside the shared greenhouse glass card. Fan-out is CSS
 * (`:hover` + `animation-timeline: view()`), no scroll listeners.
 */
export function OnRepeatCard({ albums }: Props) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <ContentCard data-on-repeat="" sx={greenhouseCardSx}>
      <Box sx={greenhouseCardHeaderSx}>
        <Typography variant="overline">On repeat</Typography>
        <Typography component="h3" variant="h3">
          Stacked albums
        </Typography>
      </Box>
      <Box sx={stacksSx}>
        {albums.map((album) => (
          <Link
            href={album.url}
            isExternal={true}
            key={album.id}
            sx={stackLinkSx}
            title={album.name}
          >
            <AlbumStack
              imageUrl={album.imageUrl}
              sleeveCount={MAX_ALBUM_SLEEVES}
              variant="greenhouse"
            >
              <AlbumCover
                alt={album.name}
                artSize={GREENHOUSE_STACK_ART_SIZE}
                depth={0}
                imageUrl={album.imageUrl}
                sizes={GREENHOUSE_STACK_ART_SIZES}
                sleeveCount={MAX_ALBUM_SLEEVES}
              />
            </AlbumStack>
            <Box>
              <Typography component="h5" variant="h5">
                {album.name}
              </Typography>
              <Typography variant="caption">
                {album.artistNames} · {playLabel(album.playCount)}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </ContentCard>
  );
}
