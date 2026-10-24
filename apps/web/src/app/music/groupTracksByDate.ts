import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { groupAdjacentAlbumPlays } from './groupAdjacentAlbumPlays';

export type TrackSection = {
  label: string;
  /** The listening stats range that covers the section, so its heading can open it. */
  statsRange: 'week' | 'month' | number;
  tracks: Array<HistoryTrack>;
};

/**
 * Sections follow Dylan's calendar, not the runtime's: the server renders in
 * UTC and the browser hydrates in the visitor's zone, and both must agree on
 * where "Today" ends.
 */
const TIME_ZONE = 'America/Los_Angeles';

const DAY_MS = 86_400_000;

const calendarDateFormat = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'numeric',
  timeZone: TIME_ZONE,
  year: 'numeric',
});

const monthYearFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: TIME_ZONE,
  year: 'numeric',
});

/** Where a moment falls on the calendar, as indices that compare with `===`. */
type CalendarPosition = {
  day: number;
  month: number;
  week: number;
};

function calendarPosition(date: Date): CalendarPosition {
  const parts = calendarDateFormat.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((candidate) => candidate.type === type)?.value);
  const year = part('year');
  const month = part('month');
  const day = Date.UTC(year, month - 1, part('day')) / DAY_MS;
  return {
    day,
    month: year * 12 + month,
    // Epoch day 0 was a Thursday, so +3 lands week boundaries on Mondays.
    week: Math.floor((day + 3) / 7),
  };
}

/** Windows relative to now, each one inside the next. */
const RECENT_LABELS = ['Today', 'This week', 'This month'];

/** Fewer album cards than this reads as a stranded row rather than a section. */
const MIN_SECTION_CARDS = 3;

/**
 * Folds a sparse recent section into the next one when that one is also
 * relative, so one play today joins "This week" instead of sitting alone.
 * Calendar months never absorb a recent section, since "September 2026" would
 * then claim plays from October.
 */
function foldSparseRecentSections(sections: Array<TrackSection>): Array<TrackSection> {
  const folded: Array<TrackSection> = [];
  for (const section of sections) {
    const previous = folded.at(-1);
    if (
      previous &&
      RECENT_LABELS.includes(previous.label) &&
      RECENT_LABELS.includes(section.label) &&
      groupAdjacentAlbumPlays(previous.tracks).length < MIN_SECTION_CARDS
    ) {
      folded[folded.length - 1] = {
        label: section.label,
        statsRange: section.statsRange,
        tracks: [...previous.tracks, ...section.tracks],
      };
    } else {
      folded.push(section);
    }
  }
  return folded;
}

/**
 * Gets the section label for a track based on when it was played, and the stats range
 * that holds it: `Today` and `This week` open the week, a past month opens its year.
 */
function getSection(
  playedAt: Date,
  now: CalendarPosition,
): Pick<TrackSection, 'label' | 'statsRange'> {
  const played = calendarPosition(playedAt);
  if (played.day === now.day) {
    return { label: 'Today', statsRange: 'week' };
  }
  if (played.week === now.week) {
    return { label: 'This week', statsRange: 'week' };
  }
  if (played.month === now.month) {
    return { label: 'This month', statsRange: 'month' };
  }
  return {
    label: monthYearFormat.format(playedAt),
    statsRange: Math.floor((played.month - 1) / 12),
  };
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
 * naturally appear in chronological order (newest first). A recent section
 * with fewer than three album cards folds into the next recent one.
 *
 * Pass every loaded play at once. Grouping pages separately splits a day that
 * straddles a page boundary into two sections with the same label.
 */
export function groupTracksByDate(
  tracks: Array<HistoryTrack>,
  nowTimestamp: number,
): Array<TrackSection> {
  if (tracks.length === 0) {
    return [];
  }

  const now = calendarPosition(new Date(nowTimestamp));
  const sections: Array<TrackSection> = [];
  let currentSection: TrackSection | null = null;

  for (const track of tracks) {
    const playedAt = new Date(track.playedAt);
    const section = getSection(playedAt, now);

    if (!currentSection || currentSection.label !== section.label) {
      currentSection = { ...section, tracks: [] };
      sections.push(currentSection);
    }

    currentSection.tracks.push(track);
  }

  return foldSparseRecentSections(sections);
}
