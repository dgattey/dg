import 'server-only';

import type {
  StravaBike,
  StravaLogEntry,
  StravaSport,
} from '@dg/content-models/strava/StravaHistory';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { stravaRoute } from '@dg/shared-core/routes/app';
import { getStravaHistory } from '../../services/strava';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import { biggestClimbs, longestOutings, yearlyTotals } from './stravaStats';

const LISTED_OUTINGS = 6;

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

const outingLink = (outing: StravaLogEntry) => `[${outing.name}](${outing.url})`;

const day = (outing: StravaLogEntry) => dayFormatter.format(new Date(outing.startDate));

const yearSpan = ({ years }: StravaBike) => {
  const first = years.at(0)?.year;
  const last = years.at(-1)?.year;
  return first === last ? `in ${first}` : `from ${first} to ${last}`;
};

const bikeLine = (bike: StravaBike) =>
  [
    `- ${bike.name}: ${miles(bike.odometerMeters)} on the odometer`,
    `${feet(bike.elevationGainMeters)} climbed`,
    `${Math.round(bike.movingTimeSeconds / 3600).toLocaleString('en-US')} hours in the saddle`,
    `${bike.rides.toLocaleString('en-US')} ${bike.rides === 1 ? 'ride' : 'rides'} ${yearSpan(bike)}`,
    `longest ride ${miles(bike.longest.distanceMeters)}, [${bike.longest.name}](${bike.longest.url}) on ${dayFormatter.format(new Date(bike.longest.startDate))}`,
  ].join(', ');

/**
 * Markdown representation of the Strava atlas — kept next to the page.
 */
export async function getStravaMarkdown(): Promise<string> {
  try {
    const history = await getStravaHistory();
    if (!history) {
      return UNAVAILABLE_MARKDOWN;
    }
    const { bikes, outings, thisYear, totals } = history;
    const climbs = biggestClimbs(outings, LISTED_OUTINGS);
    const longestRides = longestOutings(
      outings.filter((outing) => outing.sport === 'ride'),
      LISTED_OUTINGS,
    );
    const sections: Array<string> = [
      '# Big map',
      `> Routes, yearly miles, and recent outings from ${SITE_NAME}'s Strava history`,
      '## Totals',
      [
        `- ${miles(totals.distanceMeters)} over ${outingCount(totals.outings)} since ${totals.firstYear}`,
        `- ${feet(totals.elevationGainMeters)} climbed`,
      ].join('\n'),
      '## This year',
      thisYear.outings > 0
        ? `- ${thisYear.year}: ${miles(thisYear.distanceMeters)}, ${feet(thisYear.elevationGainMeters)} climbed, ${outingCount(thisYear.outings)}`
        : `- No outings yet in ${thisYear.year}`,
      '## Yearly miles',
      yearlyTotals(outings)
        .map(
          (year) => `- ${year.year}: ${miles(year.distanceMeters)} (${outingCount(year.outings)})`,
        )
        .join('\n'),
      '## Recent outings',
      outings
        .slice(0, LISTED_OUTINGS)
        .map(
          (outing) =>
            `- ${outingLink(outing)} — ${SPORT_LABELS[outing.sport]}, ${miles(outing.distanceMeters)}, ${feet(outing.elevationGainMeters)} climbed, ${day(outing)}`,
        )
        .join('\n'),
    ];

    if (longestRides.length > 0) {
      sections.push(
        '## Longest rides',
        longestRides
          .map(
            (outing) =>
              `- ${outingLink(outing)} — ${miles(outing.distanceMeters)}, ${feet(outing.elevationGainMeters)} climbed, ${day(outing)}`,
          )
          .join('\n'),
      );
    }

    if (climbs.length > 0) {
      sections.push(
        '## Biggest climbs',
        climbs
          .map(
            (outing) =>
              `- ${outingLink(outing)} — ${feet(outing.elevationGainMeters)} over ${miles(outing.distanceMeters)}, ${day(outing)}`,
          )
          .join('\n'),
      );
    }

    if (bikes.length > 0) {
      sections.push('## Bike odometers', bikes.map(bikeLine).join('\n'));
    }

    sections.push(relatedPageLinksMarkdown(stravaRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return UNAVAILABLE_MARKDOWN;
  }
}
