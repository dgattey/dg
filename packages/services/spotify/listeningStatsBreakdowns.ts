import 'server-only';

import { formatYearTick } from '@dg/shared-core/dates/periodStatus';
import type { StatsRange } from '@dg/shared-core/dates/statsRange';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import type {
  StatsChampions,
  StatsMatrix,
  StatsMatrixCell,
  StatsMatrixRow,
  StatsTimeline,
  StatsTrack,
} from './fetchListeningStats';
import { toStatsTopTrack } from './listeningStatsCatalog';
import { phaseOf, type StatsNow, shiftPhase } from './listeningStatsPhase';

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
const WEEKDAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const SHIFT_COLUMNS = [
  { full: 'Morning', key: 'morning', short: '6a', startHour: 6 },
  { full: 'Afternoon', key: 'afternoon', short: '12p', startHour: 12 },
  { full: 'Evening', key: 'evening', short: '6p', startHour: 18 },
  { full: 'Late night', key: 'lateNight', short: '12a', startHour: 0 },
] as const;

function addDaysIso(dayIso: string, deltaDays: number): string {
  const ms = Date.parse(`${dayIso}T12:00:00Z`) + deltaDays * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function lastDayOfMonth(month: string): string {
  const [year = 1970, monthOfYear = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthOfYear, 0, 12)).toISOString().slice(0, 10);
}

function isoWeekday(dayIso: string): number {
  const utcDay = new Date(`${dayIso}T12:00:00Z`).getUTCDay();
  return utcDay === 0 ? 7 : utcDay;
}

function shortDateBadge(dayIso: string): string {
  const [, monthStr = '01', dayStr = '01'] = dayIso.split('-');
  return `${Number(dayStr)} ${MONTH_ABBR[Number(monthStr) - 1] ?? 'Jan'}`;
}

function fullDateLabel(dayIso: string): string {
  const [yearStr = '', monthStr = '01', dayStr = '01'] = dayIso.split('-');
  const dow = WEEKDAY_ABBR[isoWeekday(dayIso) - 1] ?? '';
  return `${dow} ${Number(dayStr)} ${MONTH_ABBR[Number(monthStr) - 1] ?? 'Jan'} ${yearStr}`;
}

function shiftKeyForHour(hour: number): (typeof SHIFT_COLUMNS)[number]['key'] {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'lateNight';
}

function findPeakCell(rows: ReadonlyArray<StatsMatrixRow>): StatsMatrix['peakCell'] {
  let best: StatsMatrixCell | undefined;
  for (const row of rows) {
    for (const cell of row.cells) {
      if (cell.plays > 0 && (!best || cell.plays > best.plays)) {
        best = cell;
      }
    }
  }
  return best ? { key: best.key, label: best.label, plays: best.plays } : undefined;
}

function mapChampionEntries(
  bucketTopTracks: ReadonlyArray<{ bucket: string; plays: number; trackId: string }>,
  tracks: ReadonlyMap<string, StatsTrack>,
  formatBadge: (bucket: string) => string,
) {
  return bucketTopTracks
    .map((row) => {
      const track = toStatsTopTrack(tracks, row.trackId, row.plays);
      return track ? { badge: formatBadge(row.bucket), key: row.bucket, track } : null;
    })
    .filter(isNotNullish);
}

export function buildRangeBreakdowns({
  bucketTopTracks,
  dailyPlays,
  dayHourPlays,
  month,
  monthlyPlays,
  now,
  range,
  tracks,
  years,
}: {
  bucketTopTracks: ReadonlyArray<{ bucket: string; plays: number; trackId: string }>;
  dailyPlays: ReadonlyArray<{ day: string; plays: number }>;
  dayHourPlays: ReadonlyArray<{ day: string; hour: number; plays: number }>;
  /** The Pacific calendar month (`YYYY-MM`) the `month` range covers. */
  month: string;
  monthlyPlays: ReadonlyArray<{ month: number; plays: number; year: number }>;
  now: StatsNow;
  range: StatsRange;
  tracks: ReadonlyMap<string, StatsTrack>;
  years: ReadonlyArray<{ plays: number; year: number }>;
}): { champions: StatsChampions; matrix: StatsMatrix; timeline: StatsTimeline } {
  if (range.kind === 'all') {
    const sortedYears = [...years].sort((a, b) => a.year - b.year);
    const timeline: StatsTimeline = {
      points: sortedYears.map((entry) => ({
        key: `${entry.year}`,
        label: `${entry.year}`,
        phase: phaseOf(`${entry.year}`, now),
        plays: entry.plays,
        tick: formatYearTick(entry.year),
        yearFilter: entry.year,
      })),
      title: 'Plays per year',
    };
    const playsByMonth = new Map(
      monthlyPlays.map((row) => [`${row.year}-${String(row.month).padStart(2, '0')}`, row.plays]),
    );
    const matrixRows: Array<StatsMatrixRow> = sortedYears.map(({ year }) => ({
      cells: MONTH_ABBR.map((monthName, idx) => {
        const key = `${year}-${String(idx + 1).padStart(2, '0')}`;
        return {
          key,
          label: `${monthName} ${year}`,
          phase: phaseOf(key, now),
          plays: playsByMonth.get(key) ?? 0,
          yearFilter: year,
        };
      }),
      key: `${year}`,
      label: formatYearTick(year),
      yearFilter: year,
    }));
    const tracksByYear = new Map(bucketTopTracks.map((row) => [Number(row.bucket), row]));
    const entries = [...sortedYears]
      .reverse()
      .map(({ year }) => {
        const topRow = tracksByYear.get(year);
        const track = topRow ? toStatsTopTrack(tracks, topRow.trackId, topRow.plays) : null;
        return track ? { badge: `${year}`, key: `${year}`, track, yearFilter: year } : null;
      })
      .filter(isNotNullish);
    return {
      champions: { aside: '#1 song each year', entries, title: 'Soundtrack by year' },
      matrix: {
        columns: MONTH_ABBR.map((label) => ({ full: label, key: label, short: label.charAt(0) })),
        peakCell: findPeakCell(matrixRows),
        rows: matrixRows,
        title: 'Every month',
      },
      timeline,
    };
  }

  if (range.kind === 'year') {
    const year = range.year;
    const monthTotals = Array.from({ length: 12 }, () => 0);
    const monthWeekTotals = Array.from({ length: 12 }, () => [0, 0, 0, 0, 0]);
    for (const { day, plays } of dailyPlays) {
      const [, mStr = '01', dStr = '01'] = day.split('-');
      const mIdx = Number(mStr) - 1;
      const row = monthWeekTotals[mIdx];
      if (mIdx >= 0 && mIdx < 12 && row) {
        monthTotals[mIdx] = (monthTotals[mIdx] ?? 0) + plays;
        const wIdx = Math.min(4, Math.floor((Number(dStr) - 1) / 7));
        row[wIdx] = (row[wIdx] ?? 0) + plays;
      }
    }
    const weekRanges = ['1–7', '8–14', '15–21', '22–28', '29+'] as const;
    const matrixRows: Array<StatsMatrixRow> = MONTH_ABBR.map((monthName, mIdx) => {
      const month = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
      return {
        cells: weekRanges.map((span, wIdx) => {
          const key = `${month}-w${wIdx + 1}`;
          return {
            key,
            label: `${monthName} ${span}, ${year}`,
            phase: phaseOf(key, now),
            plays: monthWeekTotals[mIdx]?.[wIdx] ?? 0,
          };
        }),
        key: month,
        label: monthName,
      };
    });
    return {
      champions: {
        aside: `#1 song each month in ${year}`,
        entries: mapChampionEntries(
          bucketTopTracks,
          tracks,
          (b) => MONTH_ABBR[Number(b.split('-')[1] ?? '1') - 1] ?? b,
        ),
        title: 'Soundtrack by month',
      },
      matrix: {
        columns: [1, 2, 3, 4, 5].map((w) => ({ full: `Wk ${w}`, key: `w${w}`, short: `W${w}` })),
        peakCell: findPeakCell(matrixRows),
        rows: matrixRows,
        title: `Every week of ${year}`,
      },
      timeline: {
        points: MONTH_ABBR.map((monthName, idx) => ({
          key: `${year}-${String(idx + 1).padStart(2, '0')}`,
          label: `${monthName} ${year}`,
          phase: phaseOf(`${year}-${String(idx + 1).padStart(2, '0')}`, now),
          plays: monthTotals[idx] ?? 0,
          tick: monthName,
        })),
        title: `Plays per month, ${year}`,
      },
    };
  }

  const anchorDay = dailyPlays[dailyPlays.length - 1]?.day ?? '2026-01-01';
  const playsByDay = new Map(dailyPlays.map((row) => [row.day, row.plays]));

  if (range.kind === 'month') {
    const firstDay = `${month}-01`;
    const lastDay = lastDayOfMonth(month);
    const days: Array<string> = [];
    for (let cursor = firstDay; cursor <= lastDay; cursor = addDaysIso(cursor, 1)) {
      days.push(cursor);
    }
    const weekMondays: Array<string> = [];
    for (
      let cursor = addDaysIso(firstDay, 1 - isoWeekday(firstDay));
      cursor <= lastDay;
      cursor = addDaysIso(cursor, 7)
    ) {
      weekMondays.push(cursor);
    }
    const matrixRows: Array<StatsMatrixRow> = weekMondays.map((mondayIso) => ({
      cells: WEEKDAY_ABBR.map((_, dowIdx) => {
        const cellDay = addDaysIso(mondayIso, dowIdx);
        const phase = phaseOf(cellDay, now);
        if (cellDay < firstDay || cellDay > lastDay) {
          return { blank: true, key: cellDay, label: '', phase, plays: 0 };
        }
        return {
          key: cellDay,
          label: fullDateLabel(cellDay),
          phase,
          plays: playsByDay.get(cellDay) ?? 0,
        };
      }),
      key: mondayIso,
      label: shortDateBadge(mondayIso < firstDay ? firstDay : mondayIso),
    }));
    return {
      champions: {
        aside: '#1 song each week',
        entries: mapChampionEntries(bucketTopTracks, tracks, shortDateBadge),
        title: 'Soundtrack by week',
      },
      matrix: {
        columns: WEEKDAY_ABBR.map((label) => ({ full: label, key: label, short: label.charAt(0) })),
        peakCell: findPeakCell(matrixRows),
        rows: matrixRows,
        title: 'Every day, this month',
      },
      timeline: {
        points: days.map((dayIso) => ({
          key: dayIso,
          label: fullDateLabel(dayIso),
          phase: phaseOf(dayIso, now),
          plays: playsByDay.get(dayIso) ?? 0,
          tick: `${Number(dayIso.slice(8, 10))}`,
        })),
        title: 'Plays per day, this month',
      },
    };
  }

  const days = Array.from({ length: 7 }, (_, idx) => addDaysIso(anchorDay, idx - 6));
  const shiftTotals = new Map<string, number>();
  for (const { day, hour, plays } of dayHourPlays) {
    const key = `${day}-${shiftKeyForHour(hour)}`;
    shiftTotals.set(key, (shiftTotals.get(key) ?? 0) + plays);
  }
  const matrixRows: Array<StatsMatrixRow> = days.map((dayIso) => {
    const dow = WEEKDAY_ABBR[isoWeekday(dayIso) - 1] ?? '';
    return {
      cells: SHIFT_COLUMNS.map((col) => ({
        key: `${dayIso}-${col.key}`,
        label: `${fullDateLabel(dayIso)} · ${col.full}`,
        phase: shiftPhase(dayIso, col.startHour, now),
        plays: shiftTotals.get(`${dayIso}-${col.key}`) ?? 0,
      })),
      key: dayIso,
      label: `${dow} ${Number(dayIso.slice(8, 10))}`,
    };
  });
  return {
    champions: {
      aside: '#1 song each day',
      entries: mapChampionEntries(
        bucketTopTracks,
        tracks,
        (b) => `${WEEKDAY_ABBR[isoWeekday(b) - 1] ?? ''} ${Number(b.slice(8, 10))}`,
      ),
      title: 'Soundtrack by day',
    },
    matrix: {
      columns: SHIFT_COLUMNS.map(({ full, key, short }) => ({ full, key, short })),
      peakCell: findPeakCell(matrixRows),
      rows: matrixRows,
      title: 'Every day & shift',
    },
    timeline: {
      points: days.map((dayIso) => {
        const dow = WEEKDAY_ABBR[isoWeekday(dayIso) - 1] ?? '';
        return {
          key: dayIso,
          label: fullDateLabel(dayIso),
          phase: phaseOf(dayIso, now),
          plays: playsByDay.get(dayIso) ?? 0,
          tick: `${dow} ${Number(dayIso.slice(8, 10))}`,
        };
      }),
      title: 'Plays per day, this week',
    },
  };
}
