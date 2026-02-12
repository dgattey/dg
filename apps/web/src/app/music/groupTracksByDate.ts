import type { HistoryTrack } from '../../services/music';

export type TrackSection = {
  label: string;
  tracks: Array<HistoryTrack>;
};

/**
 * Gets the start of the ISO week (Monday) for a given date.
 */
function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  // Adjust so Monday = 0
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Checks if two dates are on the same calendar day.
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks if two dates are in the same ISO week.
 */
function isSameWeek(d1: Date, d2: Date): boolean {
  const week1 = getStartOfWeek(d1).getTime();
  const week2 = getStartOfWeek(d2).getTime();
  return week1 === week2;
}

/**
 * Checks if two dates are in the same calendar month.
 */
function isSameMonth(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

/**
 * Formats a date as "Month Year" (e.g., "January 2026").
 */
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Gets the section label for a track based on when it was played.
 */
function getSectionLabel(playedAt: Date, now: Date): string {
  if (isSameDay(playedAt, now)) {
    return 'Today';
  }
  if (isSameWeek(playedAt, now)) {
    return 'This week';
  }
  if (isSameMonth(playedAt, now)) {
    return 'This month';
  }
  return formatMonthYear(playedAt);
}

/**
 * Groups tracks by date section for display.
 *
 * Groups:
 * - "Today" — same calendar day
 * - "This week" — same ISO week but not today
 * - "This month" — same month but not this week
 * - Calendar months — "January 2026", "December 2025", etc.
 *
 * Tracks are expected to arrive in playedAt DESC order, so sections
 * naturally appear in chronological order (newest first).
 */
export function groupTracksByDate(
  tracks: Array<HistoryTrack>,
  nowTimestamp: number,
): Array<TrackSection> {
  if (tracks.length === 0) {
    return [];
  }

  const now = new Date(nowTimestamp);
  const sections: Array<TrackSection> = [];
  let currentSection: TrackSection | null = null;

  for (const track of tracks) {
    const playedAt = new Date(track.playedAt);
    const label = getSectionLabel(playedAt, now);

    if (!currentSection || currentSection.label !== label) {
      currentSection = { label, tracks: [] };
      sections.push(currentSection);
    }

    currentSection.tracks.push(track);
  }

  return sections;
}
