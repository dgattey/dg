import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';
import { PaperCard } from '../../../collage/PaperCard';
import { PaperTag } from '../../../collage/PaperTag';
import {
  ALBUM_GRID_COLUMNS,
  albumGridSx,
  albumTileFrameSx,
  albumTileSkeletonSx,
} from '../albumTileGeometry';
import {
  collageAlbumCardClassName,
  collageAlbumCardTreatment,
} from './collageAlbumCardTreatments';
import styles from './FavoriteAlbums.module.css';

const sortSwitcherSx: SxObject = {
  borderRadius: 999,
  height: 52,
  maxWidth: 420,
  width: '100%',
};

const DEFAULT_PLACEHOLDER_COUNT = 12;

const COLLAGE_SORT_SKELETONS = [
  { label: 'Recently added', tiltDeg: -3, tone: 'black' },
  { label: 'Album', tiltDeg: 2, tone: 'cream' },
  { label: 'Artist', tiltDeg: -1.5, tone: 'cream' },
  { label: 'Release date', tiltDeg: 2.5, tone: 'cream' },
] as const;

/**
 * One box the same height as `tileCount` square cells plus gaps, without
 * mounting a node per tile. Used while a view transition photographs the page.
 */
function albumGridReserveSx(tileCount: number): SxObject {
  const rows = (columns: number) => Math.ceil(tileCount / columns);
  const reserve = (columns: number, gapSum: string) => {
    const rowCount = rows(columns);
    return `calc(${(rowCount / columns) * 100}% + ${gapSum})`;
  };

  return {
    paddingBottom: (theme) => {
      const gapSum = (columns: number) => theme.spacing(2 * Math.max(0, rows(columns) - 1));
      return {
        lg: reserve(ALBUM_GRID_COLUMNS.lg, gapSum(ALBUM_GRID_COLUMNS.lg)),
        md: reserve(ALBUM_GRID_COLUMNS.md, gapSum(ALBUM_GRID_COLUMNS.md)),
        sm: reserve(ALBUM_GRID_COLUMNS.sm, gapSum(ALBUM_GRID_COLUMNS.sm)),
        xs: reserve(ALBUM_GRID_COLUMNS.xs, gapSum(ALBUM_GRID_COLUMNS.xs)),
      };
    },
  };
}

function CollageSortSkeleton() {
  return (
    <div
      aria-label="Loading album sort controls"
      className={styles.collageSortSkeleton}
      role="status"
    >
      {COLLAGE_SORT_SKELETONS.map((sort) => (
        <PaperTag
          className={styles.collageSortTag}
          edge="quad-a"
          key={sort.label}
          tiltDeg={sort.tiltDeg}
          tone={sort.tone}
        >
          <Skeleton className={styles.collageSortSkeletonLine} variant="text" />
        </PaperTag>
      ))}
    </div>
  );
}

/**
 * Occupies the same space the loaded grid will while albums stream in.
 */
export function FavoriteAlbumsSkeleton({
  surface = 'classic',
  tileCount = DEFAULT_PLACEHOLDER_COUNT,
}: {
  surface?: SiteSurface;
  tileCount?: number;
}) {
  if (surface === 'collage') {
    const tiles = Array.from({ length: tileCount }, (_, tile) => `album-${tile}`);
    return (
      <>
        <CollageSortSkeleton />
        <div className={styles.collageGridSkeleton} data-role="collage-album-skeleton-grid">
          {tiles.map((tile, index) => {
            const treatment = collageAlbumCardTreatment(index);
            return (
              <PaperCard
                className={collageAlbumCardClassName(treatment)}
                edge="quad-a"
                innerClassName={styles.collageCardInner}
                key={tile}
                tiltDeg={treatment.tiltDeg}
                tone={treatment.tone}
              >
                <Skeleton className={styles.collageArtSkeleton} variant="rectangular" />
                <div className={styles.collageCaptionSkeleton}>
                  <Skeleton variant="text" width="82%" />
                  <Skeleton variant="text" width="58%" />
                </div>
              </PaperCard>
            );
          })}
        </div>
      </>
    );
  }

  const tiles = Array.from({ length: tileCount }, (_, tile) => `album-${tile}`);
  return (
    <Stack spacing={2}>
      <Skeleton sx={sortSwitcherSx} variant="rectangular" />
      <Box sx={albumGridSx}>
        {tiles.map((tile) => (
          <Box key={tile} sx={albumTileFrameSx}>
            <Skeleton sx={albumTileSkeletonSx} variant="rectangular" />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

export function FavoriteAlbumsReserve({
  albums,
  surface = 'classic',
}: {
  albums: ReadonlyArray<PlaylistAlbum>;
  surface?: SiteSurface;
}) {
  if (surface === 'classic') {
    return (
      <Stack spacing={2}>
        <Skeleton sx={sortSwitcherSx} variant="rectangular" />
        <Box sx={albumGridReserveSx(albums.length)} />
      </Stack>
    );
  }

  return (
    <>
      <CollageSortSkeleton />
      <div
        aria-hidden="true"
        className={`${styles.collageGridSkeleton} ${styles.collageAlbumReserve}`}
        data-role="collage-album-reserve"
      >
        {albums.map((album, index) => {
          const treatment = collageAlbumCardTreatment(index);
          return (
            <PaperCard
              className={collageAlbumCardClassName(treatment)}
              edge="quad-a"
              innerClassName={styles.collageCardInner}
              key={album.id}
              tiltDeg={treatment.tiltDeg}
              tone={treatment.tone}
            >
              <div className={styles.collageReserveArt} />
              <span className={styles.collageCaption}>
                <strong className={styles.collageAlbumName}>{album.name}</strong>
                <span className={styles.collageArtist}>{album.artistNames}</span>
              </span>
            </PaperCard>
          );
        })}
      </div>
    </>
  );
}
