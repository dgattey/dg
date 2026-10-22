import 'server-only';

import { musicStatsRoute } from '@dg/shared-core/routes/app';
import { getListeningStats } from '../../../services/musicStats';
import { relatedPageLinksMarkdown } from '../../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../../metadata';
import {
  DAY_PARTS,
  formatCount,
  formatDay,
  formatDayPartHours,
  formatHourRange,
  formatMonth,
  formatPacificDay,
  formatPercent,
  peakHours,
  playsInDayPart,
  weekdayExtremes,
} from './listeningStatsFormat';

/**
 * Markdown representation of listening stats — kept next to the stats page.
 */
export async function getListeningStatsMarkdown(): Promise<string> {
  try {
    const stats = await getListeningStats();
    const sections: Array<string> = [
      '# Listening stats',
      `> Totals, top albums, and listening habits from ${SITE_NAME}'s Spotify history`,
    ];

    if (!stats) {
      sections.push('No listening history yet.');
    } else {
      const peak = peakHours(stats.hours, 2);
      const { busiest, quietest } = weekdayExtremes(stats.weekdays);
      sections.push(
        '## Totals',
        [
          `- ${formatCount(stats.plays)} plays from ${formatPacificDay(stats.firstPlayedAt)} to ${formatPacificDay(stats.lastPlayedAt)}: ${formatCount(stats.tracks)} tracks by ${formatCount(stats.artists)} artists`,
          `- About ${formatCount((stats.plays * stats.minutesPerPlay) / 60)} hours, at ${stats.minutesPerPlay.toFixed(2)} minutes per play`,
          `- Active on ${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)} days (${formatPercent(stats.activeDays, stats.spanDays)})`,
          `- ${stats.monthStreak.months} months in a row with a play, ${formatMonth(stats.monthStreak.start)} to ${formatMonth(stats.monthStreak.end)}`,
          `- ${formatPercent(stats.sessionPlays, stats.plays)} of plays heard as whole albums, in ${formatCount(stats.sessions)} sessions`,
          `- ${formatPercent(stats.shelf.plays, stats.plays)} of plays from the ${stats.shelf.albums} favorite albums`,
        ].join('\n'),
        '## Plays per year',
        stats.years.map((year) => `- ${year.year}: ${formatCount(year.plays)}`).join('\n'),
        '## Top albums, all time',
        stats.topAlbums
          .map(
            ({ album, plays }, i) =>
              `${i + 1}. [${album.name}](${album.url}) — ${album.artistNames}, ${formatCount(plays)} plays`,
          )
          .join('\n'),
        '## On repeat',
        stats.onRepeat
          .map(
            ({ plays, track, week }) =>
              `- [${track.name}](${track.url}) — ${track.artistNames}, ${plays} plays the week of ${formatDay(week)}`,
          )
          .join('\n'),
        '## When',
        [
          `- Peak hours: ${formatHourRange(peak.start, 2)} Pacific, ${formatPercent(peak.plays, stats.plays)} of plays`,
          ...DAY_PARTS.map(
            ({ label, part, startHour }) =>
              `- ${label} (${formatDayPartHours(startHour)}): ${formatPercent(playsInDayPart(stats.hours, part), stats.plays)} of plays`,
          ),
          `- Busiest day: ${busiest.name} (${formatCount(busiest.plays)}); quietest: ${quietest.name} (${formatCount(quietest.plays)})`,
        ].join('\n'),
        '## Front to back',
        stats.frontToBack
          .map(
            ({ album, plays, sessionPlays, sessions }) =>
              `- [${album.name}](${album.url}) — ${album.artistNames}: ${formatPercent(sessionPlays, plays, 0)} of ${formatCount(plays)} plays in ${sessions} full-album sessions`,
          )
          .join('\n'),
        '## Depth and loyalty',
        stats.depth
          .map(
            (artist, i) =>
              `${i + 1}. ${artist.name}: ${formatCount(artist.plays)} plays across ${artist.tracks} tracks, in ${artist.months} of ${stats.activeMonths} active months`,
          )
          .join('\n'),
      );
    }

    sections.push(relatedPageLinksMarkdown(musicStatsRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return `# Listening stats\n\n> Listening stats are unavailable right now.\n`;
  }
}
