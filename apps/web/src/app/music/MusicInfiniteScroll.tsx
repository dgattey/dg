'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { useEffect, useRef, useState } from 'react';
import { loadMoreMusicHistory } from '../../services/music.actions';
import { groupTracksByDate } from './groupTracksByDate';
import {
  CollageMusicStatus,
  MusicHistorySections,
  NoListeningHistory,
} from './MusicHistorySections';

type Props = {
  initialCursor: string | null;
  initialTracks: Array<HistoryTrack>;
};

/**
 * Music history with infinite scroll. Owns every loaded play so the first
 * page and later pages group as one list.
 */
export function MusicInfiniteScroll({ initialCursor, initialTracks }: Props) {
  const serverTime = useServerTime();
  const [tracks, setTracks] = useState<Array<HistoryTrack>>(initialTracks);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [failedCursor, setFailedCursor] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    // A fresh observer reports the still-visible sentinel immediately, so retrying a failed
    // cursor here would fire the server action in a tight loop.
    if (!sentinel || !cursor || cursor === failedCursor) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoading) {
          setIsLoading(true);
          try {
            const result = await loadMoreMusicHistory(cursor);
            setTracks((prev) => [...prev, ...result.tracks]);
            setCursor(result.nextCursor);
          } catch {
            setFailedCursor(cursor);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, failedCursor, isLoading]);

  const sections = groupTracksByDate(tracks, serverTime);

  if (sections.length === 0) {
    return <NoListeningHistory />;
  }

  return (
    <div className="music__history">
      <MusicHistorySections sections={sections} />
      <div className="music__sentinel" ref={sentinelRef}>
        {isLoading ? (
          <CollageMusicStatus>
            <span aria-hidden="true" className="music__ring" />
            <span>Loading more plays…</span>
          </CollageMusicStatus>
        ) : null}
      </div>
    </div>
  );
}
