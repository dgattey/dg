'use client';

import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import type { SxObject } from '@dg/ui/theme';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { HistoryTrack } from '../../services/music';
import { loadMoreMusicHistory } from '../../services/music.actions';
import { groupTracksByDate } from './groupTracksByDate';
import { MusicGrid } from './MusicGrid';

type Props = {
  initialTracks: Array<HistoryTrack>;
  initialCursor: string | null;
};

const loadingContainerSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  py: 2,
};

/**
 * Infinite scroll wrapper for music history.
 * Loads more tracks when sentinel element enters viewport.
 */
export function MusicInfiniteScroll({ initialTracks, initialCursor }: Props) {
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
    return <Typography>No listening history yet.</Typography>;
  }

  return (
    <Stack spacing={3}>
      {sections.map((section) => (
        <Stack key={section.label} spacing={1}>
          <Typography sx={{ paddingBlock: 2 }} variant="h2">
            {section.label}
          </Typography>
          <MusicGrid tracks={section.tracks} />
        </Stack>
      ))}

      {/* Sentinel element for infinite scroll */}
      <Box ref={sentinelRef} sx={loadingContainerSx}>
        {isLoading ? <CircularProgress size={24} /> : null}
      </Box>
    </Stack>
  );
}
