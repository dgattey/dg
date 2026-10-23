'use client';

import type { ListeningStats, StatsRangeKey } from '@dg/services/spotify/fetchListeningStats';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { inPageViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import {
  type CSSProperties,
  startTransition,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { ListeningClock } from './ListeningClock';
import { WeekCard, YearsCard } from './ListeningStatsCharts';
import { ListeningStatsTotals } from './ListeningStatsTotals';
import { formatCount, formatDay, formatPercent, formatStatsRangeKey } from './listeningStatsFormat';
import { bar, CardHead, Cover } from './StatsCardParts';
import { MonthlyMatrixCard, YearChampionsCard } from './StatsHistoryVisuals';
import { Scallop } from './StatsShapes';
import { StatsToolbar } from './StatsToolbar';
import { TopAlbumsPodium } from './TopAlbumsPodium';
import { TopArtistsCard, TopSongsCard } from './TopSongsAndArtists';

const CRATE_TILTS = [-3, 2.4, -1.6, 3] as const;

function parseClientRangeKey(raw: string | null): StatsRangeKey {
  if (raw === 'week' || raw === 'month') {
    return raw;
  }
  if (raw && /^(?:19|20)\d{2}$/.test(raw)) {
    return `${Number(raw)}`;
  }
  return 'all';
}

function OnRepeatCard({ stats }: { stats: ListeningStats }) {
  const top = stats.onRepeat[0]?.plays ?? 0;
  return (
    <PaperCard
      className="stats__card stats__repeat"
      edge="quad-b"
      innerClassName="stats__pad"
      tiltDeg={1.2}
      tone="vermilion"
    >
      <CardHead aside="Most plays of one track in a week" title="On repeat" />
      <ol className="stats__repeatList">
        {stats.onRepeat.map(({ plays, track, week }, i) => (
          <li className={cx('stats__repeatRow', i === 0 && 'stats__repeatRow--top')} key={track.id}>
            <span className="stats__rank">{String(i + 1).padStart(2, '0')}</span>
            <span className="stats__repeatName">
              <Tooltip title={track.name} whenTruncated>
                <span className="stats__label">{track.name}</span>
              </Tooltip>
              <Tooltip title={track.artistNames} whenTruncated>
                <span className="stats__meta">{track.artistNames}</span>
              </Tooltip>
            </span>
            <span aria-hidden="true" className="stats__meter" style={bar(plays, top)} />
            <span className="stats__count">{plays}</span>
            <span className="stats__meta stats__date">
              <span className="chrome__srOnly">Week of </span>
              {formatDay(week)}
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

function FrontToBackCard({ stats }: { stats: ListeningStats }) {
  const albums = [...stats.frontToBack].sort(
    (a, b) => b.sessionPlays / b.plays - a.sessionPlays / a.plays,
  );
  return (
    <PaperCard
      className="stats__card stats__rituals"
      edge="soft-b"
      innerClassName="stats__ritualsInner"
      tiltDeg={0.9}
      tone="black"
    >
      <div className="stats__ritualsLead">
        <h2 className="stats__heading">Front to back</h2>
        <p className="stats__meta">Share of each album heard in runs of 5 or more tracks.</p>
      </div>
      <ul className="stats__ritualList">
        {albums.map(({ album, plays, sessionPlays, sessions }, i) => (
          <li className="stats__ritual" key={album.id}>
            <span
              className="stats__ritualArt"
              style={{ '--r': `${CRATE_TILTS[i % CRATE_TILTS.length] ?? 0}deg` } as CSSProperties}
            >
              <Cover album={album} size={96} />
              <Scallop
                className="stats__ritualSticker"
                size="sticker"
                tiltDeg={i % 2 === 0 ? 12 : -10}
                tone="ochre"
              >
                {formatPercent(sessionPlays, plays, 0)}
              </Scallop>
            </span>
            <div>
              <span className="stats__label">{album.name}</span>
              <span className="stats__meta">{album.artistNames}</span>
            </div>
            <span aria-hidden="true" className="stats__meter" style={bar(sessionPlays, plays)} />
            <span className="stats__meta">
              {formatCount(sessionPlays)} of {formatCount(plays)} plays, {formatCount(sessions)}{' '}
              sessions
            </span>
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

function DepthCard({ stats }: { stats: ListeningStats }) {
  const perTrack = (artist: ListeningStats['depth'][number]) => artist.plays / artist.tracks;
  const most = (pick: (artist: ListeningStats['depth'][number]) => number) =>
    Math.max(...stats.depth.map(pick));
  const highlight = (value: number, max: number) =>
    cx('stats__cell', value === max && 'stats__cell--max');
  return (
    <PaperCard
      className="stats__card stats__depth"
      edge="quad-d"
      innerClassName="stats__pad"
      tiltDeg={-0.7}
    >
      <CardHead
        aside={`${formatCount(stats.activeMonths)} active months`}
        title="Depth and loyalty"
      />
      <table className="stats__table">
        <thead>
          <tr>
            <th className="stats__rank" scope="col">
              <span className="chrome__srOnly">Rank</span>
            </th>
            <th scope="col">Artist</th>
            <th className="stats__cell" scope="col">
              Plays
            </th>
            <th className="stats__cell" scope="col">
              Tracks
            </th>
            <th className="stats__cell" scope="col">
              Per track
            </th>
            <th className="stats__cell stats__monthsHead" scope="col">
              Months
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.depth.map((artist, i) => (
            <tr key={artist.name}>
              <td className="stats__rank">{String(i + 1).padStart(2, '0')}</td>
              <th className="stats__artist" scope="row">
                {artist.name}
              </th>
              <td className="stats__cell">{formatCount(artist.plays)}</td>
              <td
                className={highlight(
                  artist.tracks,
                  most((a) => a.tracks),
                )}
              >
                {formatCount(artist.tracks)}
              </td>
              <td className={highlight(perTrack(artist), most(perTrack))}>
                {perTrack(artist).toFixed(1)}
              </td>
              <td className="stats__months">
                <span
                  aria-hidden="true"
                  className="stats__meter"
                  style={bar(artist.months, stats.activeMonths)}
                />
                <span
                  className={highlight(
                    artist.months,
                    most((a) => a.months),
                  )}
                >
                  {artist.months}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaperCard>
  );
}

export function ListeningStatsSections({
  onLoadRange,
  stats: initialStats,
}: {
  onLoadRange?: (rangeKey: StatsRangeKey) => Promise<ListeningStats | null>;
  stats: ListeningStats;
}) {
  const [stats, setStats] = useState<ListeningStats>(initialStats);
  const [selectedKey, setSelectedKey] = useState<StatsRangeKey>(() =>
    formatStatsRangeKey(initialStats.range),
  );
  const cacheRef = useRef<Map<StatsRangeKey, ListeningStats>>(
    new Map([[formatStatsRangeKey(initialStats.range), initialStats]]),
  );
  const requestSeq = useRef(0);
  const onLoadRangeRef = useRef(onLoadRange);
  onLoadRangeRef.current = onLoadRange;

  const availableYears = [...stats.years].map((entry) => entry.year).sort((a, b) => b - a);

  const applyRange = (nextKey: StatsRangeKey, updateHistory = true) => {
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
      startTransition(() => setStats(cached));
      return;
    }
    const load = onLoadRangeRef.current;
    if (!load) {
      return;
    }
    const seq = ++requestSeq.current;
    void load(nextKey).then((loaded) => {
      if (!loaded || seq !== requestSeq.current) {
        return;
      }
      cacheRef.current.set(nextKey, loaded);
      startTransition(() => setStats(loaded));
    });
  };

  const applyRangeRef = useRef(applyRange);
  applyRangeRef.current = applyRange;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncFromUrl = () => {
      const urlKey = parseClientRangeKey(new URLSearchParams(window.location.search).get('range'));
      applyRangeRef.current(urlKey, false);
    };
    const initialUrlKey = parseClientRangeKey(
      new URLSearchParams(window.location.search).get('range'),
    );
    if (initialUrlKey !== formatStatsRangeKey(initialStats.range)) {
      applyRangeRef.current(initialUrlKey, false);
    }
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [initialStats]);

  const selectYear = (year: number) => applyRange(`${year}`);

  return (
    <div className="stats__sections" data-active-range={selectedKey}>
      <StatsToolbar
        availableYears={availableYears}
        onSelectRange={(nextKey) => applyRange(nextKey)}
        selectedKey={selectedKey}
      />
      <ViewTransition default={inPageViewTransitionProps('stats-filter')}>
        <div className="stats__body" key={formatStatsRangeKey(stats.range)}>
          <ListeningStatsTotals stats={stats} />
          <TopAlbumsPodium stats={stats} />
          {stats.topTracks.length > 0 || stats.topArtists.length > 0 ? (
            <div className="stats__band">
              <TopSongsCard stats={stats} />
              <TopArtistsCard stats={stats} />
            </div>
          ) : null}
          <div className="stats__band">
            <YearsCard onSelectYear={selectYear} stats={stats} />
            <WeekCard stats={stats} />
          </div>
          {stats.monthlyPlays.length > 0 || stats.yearChampions.length > 0 ? (
            <div className="stats__band">
              <MonthlyMatrixCard onSelectYear={selectYear} stats={stats} />
              <YearChampionsCard onSelectYear={selectYear} stats={stats} />
            </div>
          ) : null}
          <div className="stats__band">
            {stats.onRepeat.length > 0 ? <OnRepeatCard stats={stats} /> : null}
            <ListeningClock stats={stats} />
          </div>
          <div className="stats__band">
            {stats.depth.length > 0 ? <DepthCard stats={stats} /> : null}
            {stats.frontToBack.length > 0 ? <FrontToBackCard stats={stats} /> : null}
          </div>
        </div>
      </ViewTransition>
    </div>
  );
}
