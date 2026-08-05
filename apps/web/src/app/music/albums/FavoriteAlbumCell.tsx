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
import { Box, Card } from '@mui/material';
import { X } from 'lucide-react';
import { ViewTransition } from 'react';
import { albumArtLinkSx } from '../../spotify/albumArtStyles';

/** Art now stretches to its grid column, so sample above the legacy 150px. */
const GRID_ART_SIZE = 300;

const GRID_ART_SIZES = { extraLarge: 200, medium: 200, tiny: 180 } as const;

/**
 * Art fills its column so the row of albums lines up with the well's edges.
 * Tooltip wraps its child in an inline-flex span, which otherwise shrink-wraps
 * the art to its intrinsic size and leaves the row visibly narrower.
 */
const fillCellSx: SxObject = {
  display: 'block',
  width: '100%',
};

const cardSx: SxObject = {
  '& img': {
    display: 'block',
    height: 'auto',
    width: '100%',
  },
  borderRadius: 2,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  overflow: 'hidden',
  width: '100%',
};

/**
 * The art is away in the well, so the cell keeps a dimmed, blurred copy as the
 * socket it lifted out of and puts the close affordance where the album was.
 */
const placeholderSx: SxObject = {
  '& img': {
    filter: 'blur(5px) saturate(0.6)',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.4,
    transform: 'scale(1.1)',
    width: '100%',
  },
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, CanvasText 10%, transparent)',
  },
  alignItems: 'center',
  aspectRatio: '1',
  backgroundColor: 'color-mix(in srgb, CanvasText 6%, transparent)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 22%, transparent)',
  display: 'grid',
  justifyItems: 'center',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const closeMarkSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 78%, transparent)',
  borderRadius: '50%',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 18%, transparent)',
  color: 'text.primary',
  display: 'flex',
  gridArea: '1 / 1',
  height: 40,
  justifyContent: 'center',
  position: 'relative',
  width: 40,
};

const artSlotSx: SxObject = {
  gridArea: '1 / 1',
  height: '100%',
  lineHeight: 0,
  width: '100%',
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
 * transition; art shares a VT name with the well so it morphs on open/close.
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
          sx={{ ...albumArtLinkSx, ...fillCellSx }}
          title={`Close ${albumName}`}
          transitionTypes={albumTransitionTypes('close')}
        >
          <Box sx={placeholderSx}>
            <Box sx={artSlotSx}>
              <Image
                alt=""
                height={GRID_ART_SIZE}
                sizes={GRID_ART_SIZES}
                url={imageUrl}
                width={GRID_ART_SIZE}
              />
            </Box>
            <Box sx={closeMarkSx}>
              <X aria-hidden size={20} />
            </Box>
          </Box>
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <Link
        href={albumRoute(albumId)}
        sx={{ ...albumArtLinkSx, ...fillCellSx }}
        title={albumName}
        transitionTypes={albumTransitionTypes('open')}
      >
        <ViewTransition name={albumArtViewTransitionName(albumId)} share="vt-album-art">
          <Card sx={cardSx}>
            <Image
              alt={albumName}
              height={GRID_ART_SIZE}
              sizes={GRID_ART_SIZES}
              url={imageUrl}
              width={GRID_ART_SIZE}
            />
          </Card>
        </ViewTransition>
      </Link>
    </Tooltip>
  );
}
