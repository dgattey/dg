import 'server-only';

import type { SpotifyLink } from '@dg/services/spotify/spotifyLinks';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { musicStatsRoute } from '@dg/shared-core/routes/app';
import { getListeningStats } from '../../../services/musicStats';
import { relatedPageLinksMarkdown } from '../../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../../metadata';
import {
  DAY_PARTS,
  formatDay,
  formatDayPartHours,
  formatHourRange,
  formatMonth,
  formatPacificDay,
  formatPercent,
  peakHours,
  playsInDayPart,
} from './listeningStatsFormat';

const artistLinks = (artists: ReadonlyArray<SpotifyLink>) =>
  artists.map((artist) => `[${artist.name}](${artist.url})`).join(', ');

/**
 * Markdown representation of listening stats — kept next to the stats page.
 */
export async function getListeningStatsMarkdown(): Promise<string> {
  try {
    const stats = await getListeningStats();
    const sections: Array<string> = [
      '# Listening stats',
      `> Totals, top albums, top songs, top artists, genres, and listening habits from ${SITE_NAME}'s Spotify history`,
    ];

    if (!stats) {
      sections.push('No listening history yet.');
    } else {
      const peak = peakHours(stats.hours, 2);
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
        '## Genres',
        stats.genres
          .map(
            (item, i) =>
              `${i + 1}. ${item.genre}: ${formatCount(item.plays)} plays (${artistLinks(item.artists)})`,
          )
          .join('\n'),
        '## Top albums, all time',
        stats.topAlbums
          .map(
            ({ album, plays }, i) =>
              `${i + 1}. [${album.name}](${album.url}) — ${artistLinks(album.artists)}, ${formatCount(plays)} plays`,
          )
          .join('\n'),
        '## Top songs, all time',
        stats.topTracks
          .map(
            (track, i) =>
              `${i + 1}. [${track.name}](${track.url}) — ${artistLinks(track.artists)}, ${formatCount(track.plays)} plays`,
          )
          .join('\n'),
        '## Top artists, all time',
        stats.topArtists
          .map(
            (artist, i) =>
              `${i + 1}. [${artist.name}](${artist.url}) — ${formatCount(artist.plays)} plays across ${artist.tracks} tracks`,
          )
          .join('\n'),
        ...(stats.topPlaylists.length > 0
          ? [
              '## Top playlists, all time',
              stats.topPlaylists
                .map(
                  (playlist, i) =>
                    `${i + 1}. [${playlist.name}](${playlist.url}) — ${formatCount(playlist.plays)} plays (${formatCount(playlist.playedTracks)} of ${formatCount(playlist.totalTracks)} tracks)`,
                )
                .join('\n'),
            ]
          : []),
        '## On repeat',
        stats.onRepeat
          .map(
            ({ plays, track, week }) =>
              `- [${track.name}](${track.url}) — ${artistLinks(track.artists)}, ${plays} plays the week of ${formatDay(week)}`,
          )
          .join('\n'),
        '## When',
        [
          `- Peak hours: ${formatHourRange(peak.start, 2)} Pacific, ${formatPercent(peak.plays, stats.plays)} of plays`,
          ...DAY_PARTS.map(
            ({ label, part, startHour }) =>
              `- ${label} (${formatDayPartHours(startHour)}): ${formatPercent(playsInDayPart(stats.hours, part), stats.plays)} of plays`,
          ),
        ].join('\n'),
        '## Front to back',
        stats.frontToBack
          .map(
            ({ album, plays, sessionPlays, sessions }) =>
              `- [${album.name}](${album.url}) — ${artistLinks(album.artists)}: ${formatPercent(sessionPlays, plays, 0)} of ${formatCount(plays)} plays came while playing 5 or more of its songs in a row, ${sessions} times through`,
          )
          .join('\n'),
        '## Depth and loyalty',
        stats.topArtists
          .map(
            (artist, i) =>
              `${i + 1}. [${artist.name}](${artist.url}): ${formatCount(artist.plays)} plays across ${artist.tracks} tracks, in ${artist.months} of ${stats.activeMonths} active months`,
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
