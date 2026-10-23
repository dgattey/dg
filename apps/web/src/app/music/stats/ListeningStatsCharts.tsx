'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatHours,
  formatPercent,
  formatRangeSuffix,
} from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';
import { Stub } from './StatsShapes';

export function TimelineBarsCard({
  onPrefetchYear,
  onSelectYear,
  stats,
}: {
  onPrefetchYear?: (year: number) => void;
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { points, title } = stats.timeline;
  const max = Math.max(...points.map((point) => point.plays), 1);
  const totalPlays = points.reduce((sum, point) => sum + point.plays, 0);
  const peak = points.find((point) => point.plays === max && point.plays > 0) ?? points[0];
  const isDense = points.length > 16;
  const activePoint = hoveredKey ? points.find((point) => point.key === hoveredKey) : undefined;

  return (
    <PaperCard
      className="stats__card stats__years"
      edge="soft-a"
      innerClassName="stats__pad"
      tag={
        peak ? (
          <PaperTag className="stats__pin" tiltDeg={-4.2} tone="ochre">
            Peak {peak.tick}
          </PaperTag>
        ) : undefined
      }
      tiltDeg={-1.1}
      tone="viridian"
    >
      <CardHead
        aside={
          activePoint ? (
            <span className="stats__peak">
              {activePoint === peak ? `Peak ${activePoint.label}` : activePoint.label}:{' '}
              {formatCount(activePoint.plays)} plays,{' '}
              {formatHours((activePoint.plays * stats.minutesPerPlay) / 60)} ·{' '}
              {formatPercent(activePoint.plays, totalPlays)}
            </span>
          ) : peak ? (
            <span className="stats__peak">
              Peak {peak.label}: {formatCount(peak.plays)} plays,{' '}
              {formatHours((peak.plays * stats.minutesPerPlay) / 60)}
            </span>
          ) : null
        }
        title={title}
      />
      <ol
        className={cx(
          'stats__columns',
          isDense && 'stats__columns--dense',
          hoveredKey !== null && 'stats__columns--engaged',
        )}
        style={{ '--count': points.length } as CSSProperties}
      >
        {points.map((point, idx) => {
          const isActive = hoveredKey === point.key;
          const isPeak = point === peak && point.plays > 0;
          const showValue = isActive || (!isDense && isPeak) || (isDense && isPeak && !hoveredKey);
          const showTick =
            !isDense || idx === 0 || idx === points.length - 1 || idx % 5 === 0 || isActive;
          const yearFilter = point.yearFilter;
          return (
            <li
              aria-label={`${point.label}: ${formatCount(point.plays)} plays`}
              className={cx(
                'stats__column',
                isPeak && 'stats__column--peak',
                !isPeak && point.partial && 'stats__column--partial',
                isActive && 'stats__column--active',
              )}
              key={point.key}
              onClick={yearFilter ? () => onSelectYear?.(yearFilter) : undefined}
              onKeyDown={
                yearFilter
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectYear?.(yearFilter);
                      }
                    }
                  : undefined
              }
              onMouseEnter={() => {
                setHoveredKey(point.key);
                if (yearFilter) {
                  onPrefetchYear?.(yearFilter);
                }
              }}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <span className="stats__columnValue">
                {showValue ? formatCompact(point.plays) : null}
              </span>
              <span aria-hidden="true" className="stats__columnBar" style={bar(point.plays, max)} />
              <span className="stats__columnTick">
                <span className="chrome__srOnly">{point.label}</span>
                <span aria-hidden="true">{showTick ? point.tick : ''}</span>
              </span>
              <span className="chrome__srOnly">: {formatCount(point.plays)} plays</span>
            </li>
          );
        })}
      </ol>
    </PaperCard>
  );
}

const GENRE_TONE_CLASSES = [
  'stats__genreTone--0',
  'stats__genreTone--1',
  'stats__genreTone--2',
  'stats__genreTone--3',
  'stats__genreTone--4',
  'stats__genreTone--5',
  'stats__genreTone--6',
  'stats__genreTone--7',
] as const;

export function GenresCard({ stats }: { stats: ListeningStats }) {
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const genres = stats.genres.slice(0, 7);
  if (genres.length === 0) {
    return null;
  }
  const totalGenrePlays = Math.max(
    genres.reduce((sum, item) => sum + item.plays, 0),
    1,
  );
  const topGenrePlays = Math.max(genres[0]?.plays ?? 1, 1);
  const leadGenre = genres[0];
  const activeGenre = hoveredGenre ? genres.find((item) => item.genre === hoveredGenre) : undefined;
  const suffix = formatRangeSuffix(stats.range);

  return (
    <PaperCard
      className="stats__card stats__genres"
      edge="soft-b"
      innerClassName="stats__pad"
      tag={
        leadGenre ? (
          <Stub className="stats__cardStamp" kind="stamp" tiltDeg={4.4} tone="ochre">
            <span className="stats__cardStampKicker">#1 genre</span>
            <span className="stats__cardStampValue">{leadGenre.genre}</span>
          </Stub>
        ) : undefined
      }
      tiltDeg={1.4}
      tone="rose"
    >
      <CardHead
        aside={
          activeGenre ? (
            <span className="stats__genreReadout">
              <strong>{activeGenre.genre}</strong>: {formatCount(activeGenre.plays)} plays ·{' '}
              {formatHours((activeGenre.plays * stats.minutesPerPlay) / 60)} (
              {formatPercent(activeGenre.plays, totalGenrePlays)})
            </span>
          ) : (
            `Top ${genres.length} Spotify genres`
          )
        }
        title={`Genres, ${suffix}`}
      />
      <div
        aria-hidden="true"
        className={cx('stats__genreRibbon', hoveredGenre !== null && 'stats__genreRibbon--engaged')}
      >
        {genres.map((item, idx) => {
          const toneClass = GENRE_TONE_CLASSES[idx % GENRE_TONE_CLASSES.length] ?? '';
          const isActive = hoveredGenre === item.genre;
          return (
            <span
              className={cx(
                'stats__genreSegment',
                toneClass,
                isActive && 'stats__genreSegment--active',
              )}
              key={item.genre}
              style={{ '--share': String(item.plays / totalGenrePlays) } as CSSProperties}
            />
          );
        })}
      </div>
      <ol className="stats__genreList">
        {genres.map((item, idx) => {
          const toneClass = GENRE_TONE_CLASSES[idx % GENRE_TONE_CLASSES.length] ?? '';
          const isActive = hoveredGenre === item.genre;
          const artistsLabel = item.artists.join(' · ');
          return (
            <li
              className={cx(
                'stats__genreRow',
                idx === 0 && 'stats__topRow--lead',
                isActive && 'stats__genreRow--active',
              )}
              key={item.genre}
              onMouseEnter={() => setHoveredGenre(item.genre)}
              onMouseLeave={() => setHoveredGenre(null)}
            >
              <span aria-hidden="true" className={cx('stats__genreSwatch', toneClass)} />
              <span className="stats__repeatName">
                <Tooltip title={item.genre} whenTruncated>
                  <span className="stats__label stats__genreName">{item.genre}</span>
                </Tooltip>
                <Tooltip title={artistsLabel} whenTruncated>
                  <span className="stats__meta">{artistsLabel}</span>
                </Tooltip>
              </span>
              <span
                aria-hidden="true"
                className={cx('stats__meter', toneClass)}
                style={bar(item.plays, topGenrePlays)}
              />
              <span className="stats__topCountGroup">
                <span className="stats__count">{formatCount(item.plays)}</span>
                <span className="stats__meta">{formatPercent(item.plays, totalGenrePlays)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </PaperCard>
  );
}
