'use client';

import { albumRoute, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import {
  albumArtViewTransitionName,
  albumTransitionTypes,
} from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { X } from 'lucide-react';
import { ViewTransition } from 'react';
import { AlbumCover } from '../AlbumCover';
import { AlbumStack } from '../AlbumStack';
import {
  ALBUM_TILE_ART_SIZE,
  ALBUM_TILE_ART_SIZES,
  albumCoverSx,
  albumTileLinkSx,
  MAX_ALBUM_SLEEVES,
} from '../albumTileGeometry';

/** Every favorite is a whole album, so every cell wears the full fan. */
const SLEEVE_COUNT = MAX_ALBUM_SLEEVES;

/**
 * The art is away in the well, so the front of the stack keeps a dimmed,
 * blurred copy as the socket it lifted out of and puts the close affordance
 * where the album was. The sleeves behind it stay put, which is what keeps the
 * cell reading as the same object while its cover is gone.
 */
const socketSx: SxObject = {
  ...albumCoverSx(0, SLEEVE_COUNT),
  '& img': {
    filter: 'blur(5px) saturate(0.6)',
    opacity: 0.4,
    transform: 'scale(1.1)',
  },
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, CanvasText 10%, transparent)',
  },
  backgroundColor: 'color-mix(in srgb, CanvasText 6%, transparent)',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 22%, transparent)',
  display: 'grid',
  placeItems: 'center',
};

const closeMarkSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 78%, transparent)',
  borderRadius: '50%',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 18%, transparent)',
  color: 'text.primary',
  display: 'flex',
  height: 40,
  justifyContent: 'center',
  position: 'relative',
  width: 40,
};

type Props = {
  albumId: string;
  albumName: string;
  imageUrl: string;
  tooltip: string;
  /** When true, keep the cell size but hide art (it lives in the well). */
  collapsed?: boolean;
};

/**
 * Favorite-albums grid cell. Opens the in-page album well via a typed view
 * transition; the front cover shares a VT name with the well so it morphs on
 * open and close, while the sleeves it fans stay out of the flight entirely.
 */
export function FavoriteAlbumCell({
  albumId,
  albumName,
  imageUrl,
  tooltip,
  collapsed = false,
}: Props) {
  if (collapsed) {
    return (
      <Tooltip title={`Close ${albumName}`}>
        <Link
          href={favoriteAlbumsRoute}
          sx={albumTileLinkSx}
          title={`Close ${albumName}`}
          transitionTypes={albumTransitionTypes('close')}
        >
          <AlbumStack imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT}>
            <Box sx={socketSx}>
              <Image
                alt=""
                fill={true}
                height={ALBUM_TILE_ART_SIZE}
                sizes={ALBUM_TILE_ART_SIZES}
                url={imageUrl}
                width={ALBUM_TILE_ART_SIZE}
              />
              <Box sx={closeMarkSx}>
                <X aria-hidden size={20} />
              </Box>
            </Box>
          </AlbumStack>
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <Link
        href={albumRoute(albumId)}
        sx={albumTileLinkSx}
        title={albumName}
        transitionTypes={albumTransitionTypes('open')}
      >
        <AlbumStack imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT}>
          <ViewTransition name={albumArtViewTransitionName(albumId)} share="vt-album-art">
            <AlbumCover alt={albumName} depth={0} imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT} />
          </ViewTransition>
        </AlbumStack>
      </Link>
    </Tooltip>
  );
}
