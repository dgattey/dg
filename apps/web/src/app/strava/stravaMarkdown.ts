import 'server-only';

import type { StravaOuting, StravaSport } from '@dg/content-models/strava/StravaHistory';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { stravaRoute } from '@dg/shared-core/routes/app';
import { getStravaHistory } from '../../services/strava';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';

const UNAVAILABLE_MARKDOWN = '# Big map\n\n> Strava history is unavailable right now.\n';

const FEET_PER_METER = 3.28084;

const SPORT_LABELS: Record<StravaSport, string> = {
  hike: 'Hike',
  other: 'Outing',
  ride: 'Ride',
  run: 'Run',
};

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'America/Los_Angeles',
});

const miles = (meters: number) => formattedDistance({ distanceInMeters: meters }) ?? '0 miles';

const feet = (meters: number) =>
  `${Math.round(meters * FEET_PER_METER).toLocaleString('en-US')} feet`;

const outingCount = (outings: number) =>
  `${outings.toLocaleString('en-US')} ${outings === 1 ? 'outing' : 'outings'}`;

const outingLink = (outing: StravaOuting) => `[${outing.name}](${outing.url})`;

const day = (outing: StravaOuting) => dayFormatter.format(new Date(outing.startDate));

/**
 * Markdown representation of the Strava atlas — kept next to the page.
 */
export async function getStravaMarkdown(): Promise<string> {
  try {
    const history = await getStravaHistory();
    if (!history) {
      return UNAVAILABLE_MARKDOWN;
    }
    const { biggestClimbs, odometer, recent, thisYear, totals, years } = history;
    const sections: Array<string> = [
      '# Big map',
      `> Routes, yearly miles, and recent outings from ${SITE_NAME}'s Strava history`,
      '## Totals',
      [
        `- ${miles(totals.distanceMeters)} over ${outingCount(totals.outings)} since ${totals.firstYear}`,
        `- ${feet(totals.elevationGainMeters)} climbed`,
        ...(odometer ? [`- ${odometer.gearName} odometer: ${miles(odometer.distanceMeters)}`] : []),
      ].join('\n'),
      '## This year',
      thisYear.outings > 0
        ? `- ${thisYear.year}: ${miles(thisYear.distanceMeters)}, ${feet(thisYear.elevationGainMeters)} climbed, ${outingCount(thisYear.outings)}`
        : `- No outings yet in ${thisYear.year}`,
      '## Yearly miles',
      years
        .map(
          (year) => `- ${year.year}: ${miles(year.distanceMeters)} (${outingCount(year.outings)})`,
        )
        .join('\n'),
      '## Recent outings',
      recent
        .map(
          (outing) =>
            `- ${outingLink(outing)} — ${SPORT_LABELS[outing.sport]}, ${miles(outing.distanceMeters)}, ${feet(outing.elevationGainMeters)} climbed, ${day(outing)}`,
        )
        .join('\n'),
    ];

    if (biggestClimbs.length > 0) {
      sections.push(
        '## Biggest climbs',
        biggestClimbs
          .map(
            (outing) =>
              `- ${outingLink(outing)} — ${feet(outing.elevationGainMeters)} over ${miles(outing.distanceMeters)}, ${day(outing)}`,
          )
          .join('\n'),
      );
    }

    sections.push(relatedPageLinksMarkdown(stravaRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return UNAVAILABLE_MARKDOWN;
  }
}
