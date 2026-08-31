'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { PaperTag } from '../../collage/PaperTag';
import { AlbumCover } from './AlbumCover';
import { AlbumStack } from './AlbumStack';
import { CollageAlbumPaper, collageAlbumCardTreatment } from './albums/collageAlbumCardTreatments';
import { albumTileLinkSx, MAX_ALBUM_SLEEVES } from './albumTileGeometry';
import styles from './music.module.css';

const countChipSx: SxObject = {
  backdropFilter: 'blur(12px) saturate(150%)',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)',
  border: 'thin solid var(--mui-palette-card-border)',
  borderRadius: 999,
  bottom: 8,
  color: 'var(--mui-palette-text-primary)',
  insetInlineStart: 8,
  lineHeight: 1.4,
  paddingInline: 0.75,
  position: 'absolute',
  whiteSpace: 'nowrap',
};

type Props = {
  imageUrl: string;
  albumName: string;
  artistNames: string;
  linkUrl: string;
  trackCount: number;
  trackName: string;
  cardIndex?: number;
  surface?: SiteSurface;
};

export function AlbumPlayTile({
  albumName,
  artistNames,
  cardIndex = 0,
  imageUrl,
  linkUrl,
  surface = 'classic',
  trackCount,
  trackName,
}: Props) {
  const sleeveCount = Math.min(trackCount - 1, MAX_ALBUM_SLEEVES);
  const countLabel = `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}`;
  const isRun = trackCount > 1;
  const tooltip = isRun
    ? `${albumName} – ${artistNames}, ${countLabel}`
    : `${trackName} – ${artistNames}`;
  const title = isRun ? albumName : trackName;
  const cover = (
    <AlbumCover alt={albumName} depth={0} imageUrl={imageUrl} sleeveCount={sleeveCount} />
  );

  if (surface === 'collage') {
    return (
      <CollageAlbumPaper treatment={collageAlbumCardTreatment(cardIndex)}>
        <Tooltip title={tooltip}>
          <Link className={styles.albumLink} href={linkUrl} isExternal={true} title={tooltip}>
            <span className={`${styles.art} ${styles.fullColorArt}`}>
              <AlbumStack imageUrl={imageUrl} sleeveCount={sleeveCount}>
                {cover}
              </AlbumStack>
              {isRun ? (
                <PaperTag
                  className={styles.countTag}
                  tiltDeg={cardIndex % 2 === 0 ? 3 : -3}
                  tone="ochre"
                >
                  {countLabel}
                </PaperTag>
              ) : null}
            </span>
            <span className={styles.caption}>
              <strong className={styles.albumName}>{title}</strong>
              <span className={styles.artist}>{artistNames}</span>
            </span>
          </Link>
        </Tooltip>
      </CollageAlbumPaper>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <Link
        href={linkUrl}
        isExternal={true}
        sx={albumTileLinkSx}
        title={isRun ? tooltip : albumName}
      >
        <AlbumStack imageUrl={imageUrl} sleeveCount={sleeveCount}>
          <AlbumCover alt={albumName} depth={0} imageUrl={imageUrl} sleeveCount={sleeveCount}>
            {isRun ? (
              <Typography component="span" sx={countChipSx} variant="caption">
                {countLabel}
              </Typography>
            ) : null}
          </AlbumCover>
        </AlbumStack>
      </Link>
    </Tooltip>
  );
}
