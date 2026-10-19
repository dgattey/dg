'use client';

import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { useEffect, useRef, useState } from 'react';
import { loadMoreMusicHistory } from '../../services/music.actions';
import { PaperTag } from '../collage/PaperTag';
import { groupTracksByDate } from './groupTracksByDate';
import { CollageMusicStatus, MusicHistorySections } from './MusicHistorySections';

type Props = {
  initialCursor: string | null;
  initialSectionOffset?: number;
  initialTracks?: Array<HistoryTrack>;
  /** When true, the initial tracks were already rendered on the server by `MusicHistory`. */
  serverRenderedInitial?: boolean;
};

/**
 * Infinite scroll continuation for music history.
 * Loads more tracks when sentinel element enters viewport.
 */
export function MusicInfiniteScroll({
  initialCursor,
  initialSectionOffset = 0,
  initialTracks = [],
  serverRenderedInitial = false,
}: Props) {
  const serverTime = useServerTime();
  const [extraTracks, setExtraTracks] = useState<Array<HistoryTrack>>(
    serverRenderedInitial ? [] : initialTracks,
  );
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
            setExtraTracks((prev) => [...prev, ...result.tracks]);
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

  const sections = groupTracksByDate(extraTracks, serverTime);

  if (!serverRenderedInitial && sections.length === 0) {
    return (
      <CollageMusicStatus
        tag={
          <PaperTag className="collagePin music__stateTag" tiltDeg={-3} tone="ochre">
            Spotify
          </PaperTag>
        }
      >
        <p>No listening history yet.</p>
      </CollageMusicStatus>
    );
  }

  const body = (
    <>
      <MusicHistorySections
        sectionOffset={initialSectionOffset}
        sections={sections}
        withLcpCandidate={!serverRenderedInitial}
      />
      <div className="music__sentinel" ref={sentinelRef}>
        {isLoading ? (
          <CollageMusicStatus>
            <span aria-hidden="true" className="music__ring" />
            <span>Loading more plays…</span>
          </CollageMusicStatus>
        ) : null}
      </div>
    </>
  );

  return serverRenderedInitial ? body : <div className="music__history">{body}</div>;
}
