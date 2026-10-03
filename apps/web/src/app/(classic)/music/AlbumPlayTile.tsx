'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { AlbumCover } from './AlbumCover';
import { AlbumStack } from './AlbumStack';
import {
  collageAlbumCardClassName,
  collageAlbumCardTreatment,
} from './albums/collageAlbumCardTreatments';
import tileStyles from './albums/FavoriteAlbums.module.css';
import { albumTileLinkSx, MAX_ALBUM_SLEEVES } from './albumTileGeometry';
import styles from './MusicHistory.module.css';

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
  /** The album for a run of plays, the track itself for a single play. */
  linkUrl: string;
  /** Plays collapsed into this cell. */
  trackCount: number;
  /** Names a single play, which a lone cover is labelled with. */
  trackName: string;
  cardIndex?: number;
  surface?: SiteSurface;
};

/**
 * One cell of listening history. A run of plays from one album fans sleeves
 * behind its cover and counts itself; a single play stays a lone cover, which
 * is what tells a whole album listen apart from one song.
 */
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

  if (surface === 'collage') {
    const treatment = collageAlbumCardTreatment(cardIndex);
    return (
      <PaperCard
        className={collageAlbumCardClassName(treatment)}
        edge="quad-a"
        innerClassName={tileStyles.collageCardInner}
        tiltDeg={treatment.tiltDeg}
        tone={treatment.tone}
      >
        <Tooltip title={tooltip}>
          <Link
            className={tileStyles.collageAlbumLink}
            href={linkUrl}
            isExternal={true}
            title={tooltip}
          >
            <span
              className={`${tileStyles.collageArt} ${tileStyles.fullColorArt}`}
              data-image-treatment="full-color"
            >
              <AlbumStack imageUrl={imageUrl} sleeveCount={sleeveCount}>
                <AlbumCover
                  alt={albumName}
                  depth={0}
                  imageUrl={imageUrl}
                  sleeveCount={sleeveCount}
                />
              </AlbumStack>
              {isRun ? (
                <PaperTag
                  className={styles.collageCountTag}
                  tiltDeg={cardIndex % 2 === 0 ? 3 : -3}
                  tone="ochre"
                >
                  {countLabel}
                </PaperTag>
              ) : null}
            </span>
            <span className={tileStyles.collageCaption} data-role="album-caption">
              <strong className={tileStyles.collageAlbumName}>
                {isRun ? albumName : trackName}
              </strong>
              <span className={tileStyles.collageArtist}>{artistNames}</span>
            </span>
          </Link>
        </Tooltip>
      </PaperCard>
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
