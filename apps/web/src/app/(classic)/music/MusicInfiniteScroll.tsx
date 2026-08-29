'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import type { SxObject } from '@dg/ui/theme';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { loadMoreMusicHistory } from '../../../services/music.actions';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { groupTracksByDate } from './groupTracksByDate';
import { MusicGrid } from './MusicGrid';
import styles from './MusicHistory.module.css';

type Props = {
  initialTracks: Array<HistoryTrack>;
  initialCursor: string | null;
  surface?: SiteSurface;
};

const loadingContainerSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  py: 2,
};

/** Trailing space comes from the bar's fade ramp, so only lead the label. */
const sectionHeaderSx: SxObject = {
  paddingBlockStart: 2,
};

/**
 * Infinite scroll wrapper for music history.
 * Loads more tracks when sentinel element enters viewport.
 */
export function MusicInfiniteScroll({ initialTracks, initialCursor, surface = 'classic' }: Props) {
  const serverTime = useServerTime();
  const [allTracks, setAllTracks] = useState<Array<HistoryTrack>>(initialTracks);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !cursor) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && cursor && !isLoading) {
          setIsLoading(true);
          try {
            const result = await loadMoreMusicHistory(cursor);
            setAllTracks((prev) => [...prev, ...result.tracks]);
            setCursor(result.nextCursor);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, isLoading]);

  const sections = groupTracksByDate(allTracks, serverTime);

  if (sections.length === 0) {
    if (surface === 'collage') {
      return (
        <div className={styles.collageState} data-role="collage-music-empty" role="status">
          <PaperCard
            edge="quad-c"
            innerClassName={styles.collageStateInner}
            tiltDeg={-1.5}
            tone="cream"
          >
            <p>No listening history yet.</p>
          </PaperCard>
          <PaperTag className={styles.collageStateTag} tiltDeg={-3} tone="ochre">
            Spotify
          </PaperTag>
        </div>
      );
    }
    return <Typography>No listening history yet.</Typography>;
  }

  if (surface === 'collage') {
    return (
      <div className={styles.collageHistory}>
        {sections.map((section, sectionIndex) => (
          <section aria-label={section.label} className={styles.collageSection} key={section.label}>
            <StickyFadeBar className={styles.collageDateBar} surface="collage">
              <h2 className={styles.collageDateHeading}>
                <PaperTag
                  className={styles.collageDateTag}
                  edge="torn-b"
                  tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
                  tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
                >
                  {section.label}
                </PaperTag>
              </h2>
            </StickyFadeBar>
            <MusicGrid surface="collage" tracks={section.tracks} />
          </section>
        ))}

        <div className={styles.collageSentinel} ref={sentinelRef}>
          {isLoading ? (
            <div
              aria-live="polite"
              className={styles.collageState}
              data-role="collage-music-loading"
              role="status"
            >
              <PaperCard
                edge="quad-c"
                innerClassName={`${styles.collageStateInner} ${styles.collageLoadingInner}`}
                tiltDeg={-1.5}
                tone="cream"
              >
                <span aria-hidden="true" className={styles.collageRing} />
                <span>Loading more plays…</span>
              </PaperCard>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Stack spacing={3}>
      {sections.map((section) => (
        <Stack key={section.label} spacing={1}>
          <StickyFadeBar>
            <Typography sx={sectionHeaderSx} variant="h2">
              {section.label}
            </Typography>
          </StickyFadeBar>
          <MusicGrid surface="classic" tracks={section.tracks} />
        </Stack>
      ))}

      {/* Sentinel element for infinite scroll */}
      <Box ref={sentinelRef} sx={loadingContainerSx}>
        {isLoading ? <CircularProgress size={24} /> : null}
      </Box>
    </Stack>
  );
}
