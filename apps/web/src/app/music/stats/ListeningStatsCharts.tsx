'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatHours,
  formatPercent,
  formatRangeSuffix,
} from './listeningStatsFormat';
import {
  formatPopularity,
  PopularityLine,
  PopularityNote,
  popularityByYearKey,
} from './PopularityLine';
import { bar, CardHead } from './StatsCardParts';
import { ArtistLinks } from './StatsLinks';
import { Stub } from './StatsShapes';

export function TimelineBarsCard({
  onSelectYear,
  stats,
}: {
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
  const popularity = popularityByYearKey(stats.popularity);
  const activePopularity = activePoint ? popularity.get(activePoint.key) : undefined;
  const describe = (point: (typeof points)[number]) => {
    const pointPopularity = popularity.get(point.key);
    return `${formatCount(point.plays)} plays${pointPopularity ? `, ${formatPopularity(pointPopularity)}` : ''}`;
  };

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
            <strong className="stats__peak">
              {activePoint === peak ? `Peak ${activePoint.label}` : activePoint.label}:{' '}
              {formatCount(activePoint.plays)} plays,{' '}
              {formatHours((activePoint.plays * stats.minutesPerPlay) / 60)} ·{' '}
              {formatPercent(activePoint.plays, totalPlays)}
              {activePopularity ? ` · ${formatPopularity(activePopularity)}` : null}
            </strong>
          ) : peak ? (
            <strong className="stats__peak">
              Peak {peak.label}: {formatCount(peak.plays)} plays,{' '}
              {formatHours((peak.plays * stats.minutesPerPlay) / 60)}
            </strong>
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
          if (point.phase === 'future') {
            return (
              <li
                aria-label={`${point.label}: not here yet`}
                className="stats__column stats__column--future"
                key={point.key}
                style={{ '--column': idx + 1 } as CSSProperties}
              >
                <span className="stats__columnValue" data-typography="meta" />
                <span aria-hidden="true" className="stats__columnBar" />
                <span aria-hidden="true" className="stats__columnTick" data-typography="meta">
                  {showTick ? point.tick : ''}
                </span>
              </li>
            );
          }
          return (
            <li
              aria-label={`${point.label}: ${describe(point)}`}
              className={cx(
                'stats__column',
                isPeak && 'stats__column--peak',
                point.phase === 'current' && 'stats__column--current',
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
              }}
              onMouseLeave={() => setHoveredKey(null)}
              style={{ '--column': idx + 1 } as CSSProperties}
            >
              <span className="stats__columnValue" data-typography="meta">
                {showValue ? formatCompact(point.plays) : null}
              </span>
              <span aria-hidden="true" className="stats__columnBar" style={bar(point.plays, max)} />
              <span className="stats__columnTick" data-typography="meta">
                <span className="chrome__srOnly">{point.label}</span>
                <span aria-hidden="true">{showTick ? point.tick : ''}</span>
              </span>
              <span className="chrome__srOnly">: {describe(point)}</span>
            </li>
          );
        })}
        {popularity.size > 0 ? (
          <PopularityLine activeKey={hoveredKey} byKey={popularity} points={points} />
        ) : null}
      </ol>
      {stats.popularity && popularity.size > 0 ? (
        <PopularityNote byKey={popularity} points={points} popularity={stats.popularity} />
      ) : null}
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
          <Stub className="stats__cardStamp" kind="stamp" size="sm" tiltDeg={4.4} tone="ochre">
            <span className="stats__cardStampKicker" data-typography="stamp">
              #1 genre
            </span>
            <span className="stats__cardStampValue" data-typography="badge">
              {leadGenre.genre}
            </span>
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
                  <span className="stats__label stats__genreName" data-typography="label">
                    {item.genre}
                  </span>
                </Tooltip>
                <ArtistLinks artists={item.artists} newArtists={stats.newArtists} subject="genre" />
              </span>
              <span
                aria-hidden="true"
                className={cx('stats__meter', toneClass)}
                style={bar(item.plays, topGenrePlays)}
              />
              <span className="stats__topCountGroup">
                <span className="stats__count" data-typography="title-md">
                  {formatCount(item.plays)}
                </span>
                <span className="stats__meta" data-typography="caption">
                  {formatPercent(item.plays, totalGenrePlays)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </PaperCard>
  );
}
