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
import { ALBUM_ART_SIZE, albumArtLinkSx } from '../../spotify/albumArtStyles';

const cardSx: SxObject = {
  borderRadius: 2,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  overflow: 'hidden',
  width: '100%',
};

const placeholderSx: SxObject = {
  aspectRatio: '1',
  backgroundColor: 'color-mix(in srgb, CanvasText 4%, transparent)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 14%, transparent)',
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
          sx={{ display: 'block', ...albumArtLinkSx }}
          title={`Close ${albumName}`}
          transitionTypes={albumTransitionTypes('close')}
        >
          <Box aria-label={`Collapse ${albumName}`} sx={placeholderSx} />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <Link
        href={albumRoute(albumId)}
        sx={albumArtLinkSx}
        title={albumName}
        transitionTypes={albumTransitionTypes('open')}
      >
        <Card
          sx={{
            ...cardSx,
            viewTransitionName: albumArtViewTransitionName(albumId),
          }}
        >
          <Image
            alt={albumName}
            height={ALBUM_ART_SIZE}
            sizes={{ extraLarge: ALBUM_ART_SIZE }}
            url={imageUrl}
            width={ALBUM_ART_SIZE}
          />
        </Card>
      </Link>
    </Tooltip>
  );
}
