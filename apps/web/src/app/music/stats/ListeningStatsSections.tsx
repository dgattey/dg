'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import {
  parseStatsRangeKey,
  type StatsRangeKey,
  statsRangeKey,
} from '@dg/shared-core/dates/statsRange';
import { useEffect, useRef, useState } from 'react';
import { ListeningClock } from './ListeningClock';
import { GenresCard, TimelineBarsCard } from './ListeningStatsCharts';
import { ListeningStatsTotals } from './ListeningStatsTotals';
import { DepthCard, DepthPocketStickers, FrontToBackCard, OnRepeatCard } from './StatsCardParts';
import { ActivityMatrixCard, MatrixPocketStickers, SoundtrackCard } from './StatsHistoryVisuals';
import { StatsToolbar } from './StatsToolbar';
import { TopAlbumsPodium } from './TopAlbumsPodium';
import { TopPlaylistsCard } from './TopPlaylistsCard';
import { TopArtistsCard, TopSongsCard } from './TopSongsAndArtists';

export type InitialStatsSnapshots = {
  all: ListeningStats;
  month?: ListeningStats | null;
  week?: ListeningStats | null;
};

function buildInitialCache(
  initialStats: ListeningStats,
  snapshots?: InitialStatsSnapshots,
): Map<StatsRangeKey, ListeningStats> {
  const map = new Map<StatsRangeKey, ListeningStats>([
    [statsRangeKey(initialStats.range), initialStats],
  ]);
  if (snapshots?.all) {
    map.set('all', snapshots.all);
  }
  if (snapshots?.week) {
    map.set('week', snapshots.week);
  }
  if (snapshots?.month) {
    map.set('month', snapshots.month);
  }
  return map;
}

export function ListeningStatsSections({
  initialSnapshots,
  onLoadRange,
  stats: initialStats,
}: {
  initialSnapshots?: InitialStatsSnapshots;
  onLoadRange?: (rangeKey: StatsRangeKey) => Promise<ListeningStats | null>;
  stats: ListeningStats;
}) {
  const [stats, setStats] = useState<ListeningStats>(initialStats);
  const [selectedKey, setSelectedKey] = useState<StatsRangeKey>(() =>
    statsRangeKey(initialStats.range),
  );
  const cacheRef = useRef<Map<StatsRangeKey, ListeningStats>>(
    buildInitialCache(initialStats, initialSnapshots),
  );
  const inFlightRef = useRef<Map<StatsRangeKey, Promise<ListeningStats | null>>>(new Map());
  const prefetchTimerRef = useRef<number | undefined>(undefined);
  const requestSeq = useRef(0);
  const onLoadRangeRef = useRef(onLoadRange);
  onLoadRangeRef.current = onLoadRange;

  const availableYears = [...stats.years].map((entry) => entry.year).sort((a, b) => b - a);

  const loadRangeWithCache = (nextKey: StatsRangeKey): Promise<ListeningStats | null> | null => {
    const cached = cacheRef.current.get(nextKey);
    if (cached) {
      return Promise.resolve(cached);
    }
    const existing = inFlightRef.current.get(nextKey);
    if (existing) {
      return existing;
    }
    const load = onLoadRangeRef.current;
    if (!load) {
      return null;
    }
    const promise = load(nextKey).then((loaded) => {
      inFlightRef.current.delete(nextKey);
      if (loaded) {
        cacheRef.current.set(nextKey, loaded);
      }
      return loaded;
    });
    inFlightRef.current.set(nextKey, promise);
    return promise;
  };

  const prefetchRange = (nextKey: StatsRangeKey) => {
    if (cacheRef.current.has(nextKey) || inFlightRef.current.has(nextKey)) {
      return;
    }
    if (prefetchTimerRef.current !== undefined) {
      window.clearTimeout(prefetchTimerRef.current);
    }
    prefetchTimerRef.current = window.setTimeout(() => {
      prefetchTimerRef.current = undefined;
      if (!cacheRef.current.has(nextKey) && !inFlightRef.current.has(nextKey)) {
        void loadRangeWithCache(nextKey);
      }
    }, 180);
  };

  const applyRange = (nextKey: StatsRangeKey, updateHistory = true) => {
    if (prefetchTimerRef.current !== undefined) {
      window.clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = undefined;
    }
    setSelectedKey(nextKey);
    if (updateHistory && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nextKey === 'all') {
        url.searchParams.delete('range');
      } else {
        url.searchParams.set('range', nextKey);
      }
      window.history.pushState(null, '', url.toString());
    }
    const cached = cacheRef.current.get(nextKey);
    if (cached) {
      setStats(cached);
      return;
    }
    const pending = loadRangeWithCache(nextKey);
    if (!pending) {
      return;
    }
    const seq = ++requestSeq.current;
    void pending.then((loaded) => {
      if (!loaded || seq !== requestSeq.current) {
        return;
      }
      setStats(loaded);
    });
  };

  const applyRangeRef = useRef(applyRange);
  applyRangeRef.current = applyRange;
  const loadRangeRef = useRef(loadRangeWithCache);
  loadRangeRef.current = loadRangeWithCache;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncFromUrl = () => {
      const urlKey = parseStatsRangeKey(new URLSearchParams(window.location.search).get('range'));
      applyRangeRef.current(urlKey, false);
    };
    const initialUrlKey = parseStatsRangeKey(
      new URLSearchParams(window.location.search).get('range'),
    );
    if (initialUrlKey !== statsRangeKey(initialStats.range)) {
      applyRangeRef.current(initialUrlKey, false);
    }
    const warmupTimer =
      initialSnapshots === undefined
        ? window.setTimeout(() => {
            void loadRangeRef.current('week');
            void loadRangeRef.current('month');
          }, 120)
        : undefined;
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      if (warmupTimer !== undefined) {
        window.clearTimeout(warmupTimer);
      }
      if (prefetchTimerRef.current !== undefined) {
        window.clearTimeout(prefetchTimerRef.current);
      }
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [initialStats, initialSnapshots]);

  const selectYear = (year: number) => applyRange(`${year}`);
  const prefetchYear = (year: number) => prefetchRange(`${year}`);

  return (
    <div className="stats__sections" data-active-range={selectedKey}>
      <StatsToolbar
        availableYears={availableYears}
        onPrefetchRange={prefetchRange}
        onSelectRange={(nextKey) => applyRange(nextKey)}
        selectedKey={selectedKey}
      />
      <div className="stats__body">
        <ListeningStatsTotals stats={stats} />
        <TopAlbumsPodium stats={stats} />
        {stats.topTracks.length > 0 || stats.topArtists.length > 0 ? (
          <div className="stats__band">
            <TopSongsCard stats={stats} />
            <TopArtistsCard stats={stats} />
          </div>
        ) : null}
        {stats.topPlaylists.length > 0 ? (
          <div className="stats__band">
            <TopPlaylistsCard stats={stats} />
          </div>
        ) : null}
        <div className="stats__band">
          <TimelineBarsCard onSelectYear={selectYear} stats={stats} />
          <GenresCard stats={stats} />
        </div>
        {stats.matrix.rows.length > 0 || stats.champions.entries.length > 0 ? (
          <div className="stats__band">
            <div className="stats__slotStack stats__monthlySlot">
              <ActivityMatrixCard
                onPrefetchYear={prefetchYear}
                onSelectYear={selectYear}
                stats={stats}
              />
              {stats.champions.entries.length > 8 ? <MatrixPocketStickers stats={stats} /> : null}
            </div>
            <SoundtrackCard onPrefetchYear={prefetchYear} onSelectYear={selectYear} stats={stats} />
          </div>
        ) : null}
        <div className="stats__band">
          {stats.onRepeat.length > 0 ? <OnRepeatCard stats={stats} /> : null}
          <ListeningClock stats={stats} />
        </div>
        <div className="stats__band">
          {stats.topArtists.length > 0 ? (
            <div className="stats__slotStack stats__depthSlot">
              <DepthCard stats={stats} />
              {stats.frontToBack.length > 0 ? <DepthPocketStickers stats={stats} /> : null}
            </div>
          ) : null}
          {stats.frontToBack.length > 0 ? <FrontToBackCard stats={stats} /> : null}
        </div>
      </div>
    </div>
  );
}
