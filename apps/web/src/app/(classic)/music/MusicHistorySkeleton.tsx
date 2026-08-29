import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import {
  collageAlbumCardClassName,
  collageAlbumCardTreatment,
} from './albums/collageAlbumCardTreatments';
import { albumGridSx, albumTileFrameSx, albumTileSkeletonSx } from './albumTileGeometry';
import styles from './MusicHistory.module.css';

const headingSx: SxObject = {
  marginBlock: 2,
};

const placeholderSection = (label: string) => ({
  label,
  tiles: Array.from({ length: 12 }, (_, tile) => `${label}-${tile}`),
});

const PLACEHOLDER_SECTIONS = [placeholderSection('recent'), placeholderSection('earlier')];

/**
 * Occupies the same space the loaded grid will, so the sheet does not resize
 * under the view transition when real tracks stream in.
 */
export function MusicHistorySkeleton({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  if (surface === 'collage') {
    return (
      <div
        aria-label="Loading listening history"
        className={styles.collageSkeleton}
        data-role="collage-music-skeleton"
        role="status"
      >
        {PLACEHOLDER_SECTIONS.map((section, sectionIndex) => (
          <section aria-hidden="true" className={styles.collageSection} key={section.label}>
            <StickyFadeBar className={styles.collageDateBar} surface="collage">
              <PaperTag
                className={`${styles.collageDateTag} ${styles.collageSkeletonDate}`}
                edge="torn-b"
                tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
                tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
              >
                <Skeleton className={styles.collageSkeletonLine} variant="text" />
              </PaperTag>
            </StickyFadeBar>
            <div className={styles.collageSkeletonGrid} data-role="collage-music-skeleton-grid">
              {section.tiles.map((tile, cardIndex) => {
                const treatment = collageAlbumCardTreatment(cardIndex);
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
          </section>
        ))}
      </div>
    );
  }

  return (
    <Stack spacing={3}>
      {PLACEHOLDER_SECTIONS.map((section) => (
        <Stack key={section.label} spacing={1}>
          <Skeleton height={40} sx={headingSx} width={160} />
          <Box sx={albumGridSx}>
            {section.tiles.map((tile) => (
              <Box key={tile} sx={albumTileFrameSx}>
                <Skeleton sx={albumTileSkeletonSx} variant="rectangular" />
              </Box>
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
