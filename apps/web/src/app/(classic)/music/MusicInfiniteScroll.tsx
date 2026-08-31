'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import type { SxObject } from '@dg/ui/theme';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { loadMoreMusicHistory } from '../../../services/music.actions';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { groupTracksByDate } from './groupTracksByDate';
import { MusicGrid } from './MusicGrid';
import styles from './music.module.css';

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

function CollageStatus({ children, tag }: { children: ReactNode; tag?: ReactNode }) {
  return (
    <div className={styles.state} role="status">
      <PaperCard
        edge="quad-c"
        innerClassName={`${styles.stateInner}${tag ? '' : ` ${styles.loadingInner}`}`}
        tiltDeg={-1.5}
        tone="cream"
      >
        {children}
      </PaperCard>
      {tag}
    </div>
  );
}

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

  if (surface === 'collage') {
    if (sections.length === 0) {
      return (
        <CollageStatus
          tag={
            <PaperTag className={`collagePin ${styles.stateTag}`} tiltDeg={-3} tone="ochre">
              Spotify
            </PaperTag>
          }
        >
          <p>No listening history yet.</p>
        </CollageStatus>
      );
    }

    return (
      <div className={styles.history}>
        {sections.map((section, sectionIndex) => (
          <section aria-label={section.label} className={styles.section} key={section.label}>
            <StickyFadeBar className={styles.dateBar} surface="collage">
              <h2 className={styles.dateHeading}>
                <PaperTag
                  className={styles.dateTag}
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
        <div className={styles.sentinel} ref={sentinelRef}>
          {isLoading ? (
            <CollageStatus>
              <span aria-hidden="true" className={styles.ring} />
              <span>Loading more plays…</span>
            </CollageStatus>
          ) : null}
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return <Typography>No listening history yet.</Typography>;
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

      <Box ref={sentinelRef} sx={loadingContainerSx}>
        {isLoading ? <CircularProgress size={24} /> : null}
      </Box>
    </Stack>
  );
}
