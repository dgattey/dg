'use client';

import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Card } from '@mui/material';
import { ALBUM_ART_SIZE, albumArtLinkSx } from './albumArtStyles';

const cardSx: SxObject = {
  borderRadius: 2,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  overflow: 'hidden',
};

type AlbumThumbnailProps = {
  /** Album art URL */
  imageUrl: string;
  /** Album name for alt text */
  albumName: string;
  /** External link URL (Spotify album/track) */
  linkUrl: string;
  /** Tooltip text (e.g., "Track Name – Artist") */
  tooltip: string;
};

/**
 * Album art thumbnail with bouncy hover effect and tooltip.
 * Used for grid displays of track history.
 */
export function AlbumThumbnail({ imageUrl, albumName, linkUrl, tooltip }: AlbumThumbnailProps) {
  return (
    <Tooltip title={tooltip}>
      <Link href={linkUrl} isExternal={true} sx={albumArtLinkSx} title={albumName}>
        <Card sx={cardSx}>
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
