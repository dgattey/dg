'use client';

import type { ListeningStats, StatsMatrixCell } from '@dg/services/spotify/fetchListeningStats';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { musicRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { Image } from '@dg/ui/dependent/Image';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { formatDay, formatHours } from './listeningStatsFormat';
import { CardHead } from './StatsCardParts';
import { AlbumLink, ArtistLinks, SpotifyAnchor } from './StatsLinks';
import { Scallop, Stub } from './StatsShapes';

const CHAMPION_TILTS = [-2.2, 1.8, -1.5, 2.3, -1.9, 1.6] as const;

/** What one matrix cell counts, by range, for the stamp's `Active …` kicker. */
const ACTIVE_UNITS = {
  all: 'months',
  month: 'days',
  week: 'day parts',
  year: 'weeks',
} as const satisfies Record<ListeningStats['range']['kind'], string>;

function matrixTier(plays: number, maxPlays: number): 0 | 1 | 2 | 3 | 4 {
  if (plays <= 0 || maxPlays <= 0) return 0;
  const ratio = plays / maxPlays;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.78) return 3;
  return 4;
}

export function ActivityMatrixCard({
  onPrefetchYear,
  onSelectYear,
  stats,
}: {
  onPrefetchYear?: (year: number) => void;
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const [hoveredCell, setHoveredCell] = useState<StatsMatrixCell | null>(null);
  const { columns, peakCell, rows, title } = stats.matrix;

  if (rows.length === 0) {
    return null;
  }

  const maxPlays = Math.max(peakCell?.plays ?? 0, 1);
  const activeCellsCount = rows.reduce(
    (sum, row) => sum + row.cells.filter((cell) => cell.plays > 0).length,
    0,
  );
  const activeEntry = hoveredCell ?? peakCell;
  const activeUnit = ACTIVE_UNITS[stats.range.kind];

  return (
    <PaperCard
      className="stats__card stats__monthly"
      edge="soft-a"
      innerClassName="stats__pad"
      tag={
        <Stub className="stats__cardStamp" kind="ticket" size="sm" tiltDeg={-3.5} tone="cobalt">
          <span className="stats__cardStampKicker" data-typography="stamp">
            Active {activeUnit}
          </span>
          <span className="stats__cardStampValue" data-typography="badge">
            {formatCount(activeCellsCount)}
          </span>
        </Stub>
      }
      tiltDeg={-0.6}
      tone="cream"
    >
      <CardHead
        aside={
          activeEntry ? (
            <span className="stats__monthReadout">
              <strong>
                {!hoveredCell && peakCell ? `Peak ${activeEntry.label}` : activeEntry.label}
              </strong>
              : {formatCount(activeEntry.plays)} plays,{' '}
              {formatHours((activeEntry.plays * stats.minutesPerPlay) / 60)}
            </span>
          ) : null
        }
        title={title}
      />
      <div
        className="stats__monthMatrix"
        style={{ '--matrix-cols': columns.length } as CSSProperties}
      >
        <div aria-hidden="true" className="stats__monthHeaderRow">
          <span />
          {columns.map((col) => (
            <span className="stats__monthColHead" data-typography="stamp" key={col.key}>
              <span className="stats__monthColFull">{col.full}</span>
              <span className="stats__monthColShort">{col.short}</span>
            </span>
          ))}
        </div>
        {rows.map((row) => {
          const yearFilter = row.yearFilter;
          return (
            <div className="stats__monthRow" key={row.key}>
              {yearFilter ? (
                <button
                  className="stats__monthYearBtn"
                  data-typography="badge"
                  onClick={() => onSelectYear?.(yearFilter)}
                  onMouseEnter={() => onPrefetchYear?.(yearFilter)}
                  title={`Filter by ${yearFilter}`}
                  type="button"
                >
                  <span className="chrome__srOnly">{yearFilter}</span>
                  <span aria-hidden="true">{row.label}</span>
                </button>
              ) : (
                <span className="stats__monthRowLabel" data-typography="badge">
                  {row.label}
                </span>
              )}
              {row.cells.map((cell) => {
                const tier = matrixTier(cell.plays, maxPlays);
                const isPeak = peakCell?.key === cell.key && cell.plays > 0;
                const isHovered = hoveredCell?.key === cell.key;
                if (cell.blank) {
                  return (
                    <span
                      aria-hidden="true"
                      className="stats__monthCell stats__monthCell--blank"
                      key={cell.key}
                    />
                  );
                }
                if (cell.phase === 'future' || cell.plays <= 0) {
                  return (
                    <span
                      aria-hidden="true"
                      className={cx(
                        'stats__monthCell',
                        cell.phase === 'future'
                          ? 'stats__monthCell--future'
                          : 'stats__monthCell--t0',
                        cell.phase === 'current' && 'stats__monthCell--current',
                      )}
                      key={cell.key}
                    />
                  );
                }
                const cellYearFilter = cell.yearFilter;
                return (
                  <button
                    aria-label={`${cell.label}: ${formatCount(cell.plays)} plays`}
                    className={cx(
                      'stats__monthCell',
                      `stats__monthCell--t${tier}`,
                      isPeak && 'stats__monthCell--peak',
                      cell.phase === 'current' && 'stats__monthCell--current',
                      isHovered && 'stats__monthCell--active',
                    )}
                    key={cell.key}
                    onBlur={() => setHoveredCell(null)}
                    onClick={cellYearFilter ? () => onSelectYear?.(cellYearFilter) : undefined}
                    onFocus={() => setHoveredCell(cell)}
                    onMouseEnter={() => {
                      setHoveredCell(cell);
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    type="button"
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </PaperCard>
  );
}

/**
 * Collage stickers tucked into the open pocket beneath the activity matrix while the
 * soundtrack card extends down the right column.
 */
export function MatrixPocketStickers({ stats }: { stats: ListeningStats }) {
  const dailyPace = Math.max(1, Math.round(stats.plays / Math.max(stats.activeDays, 1)));
  const streakRange =
    stats.dayStreak.start && stats.dayStreak.end
      ? stats.dayStreak.start === stats.dayStreak.end
        ? formatDay(stats.dayStreak.start)
        : `${formatDay(stats.dayStreak.start)} to ${formatDay(stats.dayStreak.end)}`
      : 'in a row';

  return (
    <div className="stats__pocketCluster">
      <Stub className="stats__pocketStub" kind="ticket" tiltDeg={-4.6} tone="ochre">
        <span className="stats__meta stats__totalLabel" data-typography="meta">
          Longest listening streak
        </span>
        <span data-typography="stat-md">{formatCount(stats.dayStreak.days)} days</span>
        <span className="stats__meta" data-typography="caption">
          {streakRange}
        </span>
      </Stub>
      <Scallop className="stats__pocketSeal" tiltDeg={6.4} tone="viridian">
        <span className="stats__meta stats__totalLabel" data-typography="badge">
          On a listening day
        </span>
        <span data-typography="title-md">{formatCount(dailyPace)}</span>
        <span className="stats__meta" data-typography="badge">
          plays on average
        </span>
      </Scallop>
      <PageTransitionLink
        className="stats__pocketLink collageLift"
        href={musicRoute}
        title="Listening history"
      >
        <Stub className="stats__pocketStub" kind="stamp" tiltDeg={-3.2} tone="rose">
          <span className="stats__meta stats__totalLabel" data-typography="meta">
            Different songs
          </span>
          <span data-typography="stat-md">{formatCount(stats.tracks)}</span>
          <span className="stats__meta" data-typography="caption">
            by {formatCount(stats.artists)} artists →
          </span>
        </Stub>
      </PageTransitionLink>
    </div>
  );
}

export function SoundtrackCard({
  onPrefetchYear,
  onSelectYear,
  stats,
}: {
  onPrefetchYear?: (year: number) => void;
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const { aside, entries, title } = stats.champions;
  if (entries.length === 0) {
    return null;
  }
  const isCompact = entries.length > 8;
  const artSize = isCompact ? 28 : 34;

  return (
    <PaperCard
      className="stats__card stats__champions"
      edge="quad-c"
      innerClassName="stats__pad"
      tag={
        <Scallop className="stats__cardSeal" tiltDeg={8} tone="vermilion">
          <span data-typography="badge">#1</span>
          <span className="stats__cardSealSub" data-typography="stamp">
            song
          </span>
        </Scallop>
      }
      tiltDeg={0.8}
      tone="black"
    >
      <CardHead aside={aside} title={title} />
      <ol className={cx('stats__championList', isCompact && 'stats__championList--compact')}>
        {entries.map(({ badge, key, track, yearFilter }, i) => (
          <li className="stats__championRow" key={key}>
            {yearFilter ? (
              <button
                className="stats__championYear"
                data-typography="badge"
                onClick={() => onSelectYear?.(yearFilter)}
                onMouseEnter={() => onPrefetchYear?.(yearFilter)}
                title={`Filter by ${yearFilter}`}
                type="button"
              >
                {badge}
              </button>
            ) : (
              <span
                className="stats__championYear stats__championYear--static"
                data-typography="badge"
              >
                {badge}
              </span>
            )}
            <span className="stats__championEntry">
              <AlbumLink album={track.album} label={track.album.name}>
                <span
                  className="stats__mat stats__championMat"
                  style={
                    {
                      '--r': `${CHAMPION_TILTS[i % CHAMPION_TILTS.length] ?? 0}deg`,
                    } as CSSProperties
                  }
                >
                  <Image
                    alt={`${track.album.name} cover`}
                    height={artSize}
                    sizes={{ extraLarge: artSize }}
                    url={track.album.imageUrl}
                    width={artSize}
                  />
                </span>
              </AlbumLink>
              <span className="stats__championMain">
                <Tooltip title={track.name} whenTruncated>
                  <SpotifyAnchor
                    className="stats__championTrack"
                    href={track.url}
                    variant={isCompact ? 'badge' : 'row-title'}
                  >
                    {track.name}
                  </SpotifyAnchor>
                </Tooltip>
                <ArtistLinks
                  artists={track.artists}
                  className="stats__meta stats__championArtist"
                  newArtists={stats.newArtists}
                  variant="caption"
                />
              </span>
              <span className="stats__championPlays" data-typography="badge">
                {formatCount(track.plays)} {track.plays === 1 ? 'play' : 'plays'}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}
