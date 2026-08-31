'use client';

import { albumRoute, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
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
import styles from '../music.module.css';
import { type CollageAlbumCardTreatment, CollageAlbumPaper } from './collageAlbumCardTreatments';

const SLEEVE_COUNT = MAX_ALBUM_SLEEVES;

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
  artistCaption: string;
  collageTreatment: CollageAlbumCardTreatment;
  imageUrl: string;
  surface?: SiteSurface;
  tooltip: string;
  collapsed?: boolean;
};

function AlbumArtCover({
  albumId,
  albumName,
  collapsed,
  imageUrl,
}: {
  albumId: string;
  albumName: string;
  collapsed: boolean;
  imageUrl: string;
}) {
  if (collapsed) {
    return <AlbumCover alt="" depth={0} imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT} />;
  }
  return (
    <ViewTransition default="none" name={albumArtViewTransitionName(albumId)} share="vt-album-art">
      <AlbumCover alt={albumName} depth={0} imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT} />
    </ViewTransition>
  );
}

export function FavoriteAlbumCell({
  albumId,
  albumName,
  artistCaption,
  collageTreatment,
  imageUrl,
  surface = 'classic',
  tooltip,
  collapsed = false,
}: Props) {
  if (surface === 'collage') {
    const href = collapsed ? favoriteAlbumsRoute : albumRoute(albumId);
    const title = collapsed ? `Close ${albumName}` : albumName;
    return (
      <CollageAlbumPaper selected={collapsed} treatment={collageTreatment}>
        <Tooltip title={collapsed ? `Close ${albumName}` : tooltip}>
          <Link
            className={styles.albumLink}
            href={href}
            title={title}
            transitionTypes={albumTransitionTypes(collapsed ? 'close' : 'open')}
          >
            <span className={`${styles.art} ${styles.fullColorArt}`}>
              <AlbumStack imageUrl={imageUrl} sleeveCount={SLEEVE_COUNT}>
                <AlbumArtCover
                  albumId={albumId}
                  albumName={albumName}
                  collapsed={collapsed}
                  imageUrl={imageUrl}
                />
                {collapsed ? (
                  <i aria-hidden="true" className={styles.closeMark}>
                    ×
                  </i>
                ) : null}
              </AlbumStack>
            </span>
            <span className={styles.caption}>
              <strong className={styles.albumName}>{albumName}</strong>
              <span className={styles.artist}>{artistCaption}</span>
            </span>
          </Link>
        </Tooltip>
      </CollageAlbumPaper>
    );
  }

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
          <AlbumArtCover
            albumId={albumId}
            albumName={albumName}
            collapsed={false}
            imageUrl={imageUrl}
          />
        </AlbumStack>
      </Link>
    </Tooltip>
  );
}
