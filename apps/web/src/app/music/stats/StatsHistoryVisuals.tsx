'use client';

import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { formatCount, formatHours, formatMonth, formatYearTick } from './listeningStatsFormat';
import { CardHead } from './StatsCardParts';

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const CHAMPION_TILTS = [-2.2, 1.8, -1.5, 2.3, -1.9, 1.6] as const;

function monthTier(plays: number, maxPlays: number): 0 | 1 | 2 | 3 | 4 {
  if (plays <= 0 || maxPlays <= 0) return 0;
  const ratio = plays / maxPlays;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.78) return 3;
  return 4;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function MonthlyMatrixCard({
  onSelectYear,
  stats,
}: {
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const [hoveredCell, setHoveredCell] = useState<{
    month: number;
    plays: number;
    year: number;
  } | null>(null);

  if (stats.monthlyPlays.length === 0) {
    return null;
  }

  const playsByKey = new Map(
    stats.monthlyPlays.map((entry) => [monthKey(entry.year, entry.month), entry.plays]),
  );
  const maxPlays = Math.max(...stats.monthlyPlays.map((entry) => entry.plays), 1);
  const peakEntry = stats.monthlyPlays.find((entry) => entry.plays === maxPlays);
  const years = [...new Set(stats.years.map((row) => row.year))].sort((a, b) => a - b);
  const selectedYear = stats.range.kind === 'year' ? stats.range.year : null;
  const activeEntry = hoveredCell ?? peakEntry;

  return (
    <PaperCard
      className="stats__card stats__monthly"
      edge="soft-a"
      innerClassName="stats__pad"
      tiltDeg={-0.6}
      tone="cream"
    >
      <CardHead
        aside={
          activeEntry ? (
            <span className="stats__monthReadout">
              <strong>
                {activeEntry === peakEntry && !hoveredCell
                  ? `Peak ${formatMonth(monthKey(activeEntry.year, activeEntry.month))}`
                  : formatMonth(monthKey(activeEntry.year, activeEntry.month))}
              </strong>
              : {formatCount(activeEntry.plays)} plays,{' '}
              {formatHours((activeEntry.plays * stats.minutesPerPlay) / 60)}
            </span>
          ) : null
        }
        title="Every month"
      />
      <div className="stats__monthMatrix">
        <div aria-hidden="true" className="stats__monthHeaderRow">
          <span />
          {MONTH_ABBR.map((label) => (
            <span className="stats__monthColHead" key={label}>
              <span className="stats__monthColFull">{label}</span>
              <span className="stats__monthColShort">{label.charAt(0)}</span>
            </span>
          ))}
        </div>
        {years.map((year) => {
          const isSelectedYear = selectedYear === year;
          return (
            <div
              className={cx('stats__monthRow', isSelectedYear && 'stats__monthRow--selected')}
              key={year}
            >
              <button
                className="stats__monthYearBtn"
                onClick={() => onSelectYear?.(year)}
                title={`Filter by ${year}`}
                type="button"
              >
                <span className="chrome__srOnly">{year}</span>
                <span aria-hidden="true">{formatYearTick(year)}</span>
              </button>
              {MONTH_ABBR.map((label, idx) => {
                const month = idx + 1;
                const key = monthKey(year, month);
                const plays = playsByKey.get(key) ?? 0;
                const tier = monthTier(plays, maxPlays);
                const isPeak = peakEntry?.year === year && peakEntry.month === month && plays > 0;
                const isHovered = hoveredCell?.year === year && hoveredCell.month === month;
                if (plays <= 0) {
                  return (
                    <span
                      aria-hidden="true"
                      className="stats__monthCell stats__monthCell--t0"
                      key={key}
                    />
                  );
                }
                return (
                  <button
                    aria-label={`${label} ${year}: ${formatCount(plays)} plays`}
                    className={cx(
                      'stats__monthCell',
                      `stats__monthCell--t${tier}`,
                      isPeak && 'stats__monthCell--peak',
                      isHovered && 'stats__monthCell--active',
                    )}
                    key={key}
                    onBlur={() => setHoveredCell(null)}
                    onClick={() => onSelectYear?.(year)}
                    onFocus={() => setHoveredCell({ month, plays, year })}
                    onMouseEnter={() => setHoveredCell({ month, plays, year })}
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

export function YearChampionsCard({
  onSelectYear,
  stats,
}: {
  onSelectYear?: (year: number) => void;
  stats: ListeningStats;
}) {
  const champions = stats.yearChampions;
  if (champions.length === 0) {
    return null;
  }
  const selectedYear = stats.range.kind === 'year' ? stats.range.year : null;

  return (
    <PaperCard
      className="stats__card stats__champions"
      edge="quad-c"
      innerClassName="stats__pad"
      tiltDeg={0.8}
      tone="black"
    >
      <CardHead aside="#1 song each year" title="Soundtrack by year" />
      <ol className="stats__championList">
        {champions.map(({ track, year }, i) => {
          const isSelected = selectedYear === year;
          const trackBody = (
            <>
              {track.albumImageUrl ? (
                <span
                  className="stats__mat stats__championMat"
                  style={
                    {
                      '--r': `${CHAMPION_TILTS[i % CHAMPION_TILTS.length] ?? 0}deg`,
                    } as CSSProperties
                  }
                >
                  <Image
                    alt={`${track.albumName || track.name} by ${track.artistNames}`}
                    height={34}
                    sizes={{ extraLarge: 34 }}
                    url={track.albumImageUrl}
                    width={34}
                  />
                </span>
              ) : (
                <span aria-hidden="true" className="stats__championArtEmpty" />
              )}
              <span className="stats__championMain">
                <Tooltip title={track.name} whenTruncated>
                  <span className="stats__championTrack">{track.name}</span>
                </Tooltip>
                <Tooltip title={track.artistNames} whenTruncated>
                  <span className="stats__meta stats__championArtist">{track.artistNames}</span>
                </Tooltip>
              </span>
              <span className="stats__championPlays">
                {formatCount(track.plays)} {track.plays === 1 ? 'play' : 'plays'}
              </span>
            </>
          );
          return (
            <li
              className={cx('stats__championRow', isSelected && 'stats__championRow--selected')}
              key={year}
            >
              <button
                className="stats__championYear"
                onClick={() => onSelectYear?.(year)}
                title={`Filter by ${year}`}
                type="button"
              >
                {year}
              </button>
              {track.url ? (
                <a
                  className="stats__championLink"
                  href={track.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {trackBody}
                </a>
              ) : (
                <span className="stats__championLink">{trackBody}</span>
              )}
            </li>
          );
        })}
      </ol>
    </PaperCard>
  );
}
