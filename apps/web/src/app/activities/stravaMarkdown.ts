import 'server-only';

import type { StravaBike, StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import {
  COVERAGE_CITIES,
  type CoverageCity,
  type StreetCoverage,
} from '@dg/content-models/strava/StreetCoverage';
import { formatCount, formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { activitiesRoute } from '@dg/shared-core/routes/app';
import { getStravaHistory } from '../../services/strava';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import { formatShare, summarizeCoverage } from './coverageStats';
import { type Comparison, distanceComparison, everestComparison } from './stravaComparisons';
import { formatFeet, formatMiles, formatOutingDate } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';
import { biggestClimbs, longestOutings, yearlyTotals } from './stravaStats';

const LISTED_OUTINGS = 6;

const LISTED_NEIGHBORHOODS = 5;

const CITY_NAMES: Record<CoverageCity, string> = { sd: 'San Diego', sf: 'San Francisco' };

const UNAVAILABLE_MARKDOWN = '# Big map\n\n> Strava history is unavailable right now.\n';

const miles = (meters: number) => formattedDistance({ distanceInMeters: meters }) ?? '0 miles';

const feet = (meters: number) => `${formatFeet(meters)} feet`;

const outingCount = (outings: number) =>
  `${formatCount(outings)} ${outings === 1 ? 'activity' : 'activities'}`;

const sportCount = (outings: ReadonlyArray<StravaLogEntry>) => {
  const sports = new Set(outings.map((outing) => outing.sport)).size;
  return `${sports} ${sports === 1 ? 'sport' : 'sports'}`;
};

const said = ({ figure, unit }: Comparison) => `≈ ${figure} ${unit}`;

const outingLink = (outing: StravaLogEntry) => `[${outing.name}](${outing.url})`;

const day = (outing: StravaLogEntry) => formatOutingDate(outing.startDate);

const yearSpan = ({ years }: StravaBike) => {
  const first = years.at(0)?.year;
  const last = years.at(-1)?.year;
  return first === last ? `in ${first}` : `from ${first} to ${last}`;
};

const bikeLine = (bike: StravaBike) =>
  [
    `- ${bike.name}: ${miles(bike.odometerMeters)} on the odometer`,
    `${feet(bike.elevationGainMeters)} climbed`,
    `${formatCount(bike.movingTimeSeconds / 3600)} hours in the saddle`,
    `${formatCount(bike.rides)} ${bike.rides === 1 ? 'ride' : 'rides'} ${yearSpan(bike)}`,
    `longest ride ${miles(bike.longest.distanceMeters)}, [${bike.longest.name}](${bike.longest.url}) on ${formatOutingDate(bike.longest.startDate)}`,
  ].join(', ');

const coverageLines = (coverage: StreetCoverage) => {
  const { city, explored, neighborhoods, ranked } = summarizeCoverage(coverage, 'all', 'all');
  return [
    `- City: ${formatShare(city.share)} of rideable streets, ${formatMiles(city.riddenMeters)} of ${formatMiles(city.streetMeters)} miles, ${explored} of ${neighborhoods.length} neighborhoods explored`,
    ...ranked
      .slice(0, LISTED_NEIGHBORHOODS)
      .filter((hood) => hood.riddenMeters > 0)
      .map(
        (hood) =>
          `- ${hood.name}: ${formatShare(hood.share)}, ${formatMiles(hood.riddenMeters)} of ${formatMiles(hood.streetMeters)} miles`,
      ),
  ].join('\n');
};

/**
 * Markdown representation of the Strava atlas — kept next to the page.
 */
export async function getStravaMarkdown(): Promise<string> {
  try {
    const history = await getStravaHistory();
    if (!history) {
      return UNAVAILABLE_MARKDOWN;
    }
    const { bikes, outings, streetCoverage, thisYear, totals } = history;
    const climbs = biggestClimbs(outings, LISTED_OUTINGS);
    const longestRides = longestOutings(
      outings.filter((outing) => outing.sport === 'ride'),
      LISTED_OUTINGS,
    );
    const sections: Array<string> = [
      '# Big map',
      `> Routes, yearly miles, and recent activities from ${SITE_NAME}'s Strava history`,
      '## Totals',
      [
        `- ${miles(totals.distanceMeters)} (${said(distanceComparison(totals.distanceMeters))}) over ${outingCount(totals.outings)} in ${sportCount(outings)} since ${totals.firstYear}`,
        `- ${feet(totals.elevationGainMeters)} climbed (${said(everestComparison(totals.elevationGainMeters))})`,
      ].join('\n'),
      '## This year',
      thisYear.outings > 0
        ? `- ${thisYear.year}: ${miles(thisYear.distanceMeters)}, ${feet(thisYear.elevationGainMeters)} climbed, ${outingCount(thisYear.outings)}`
        : `- No activities yet in ${thisYear.year}`,
      '## Yearly miles',
      yearlyTotals(outings)
        .map(
          (year) => `- ${year.year}: ${miles(year.distanceMeters)} (${outingCount(year.outings)})`,
        )
        .join('\n'),
      '## Recent activities',
      outings
        .slice(0, LISTED_OUTINGS)
        .map(
          (outing) =>
            `- ${outingLink(outing)} — ${SPORT_DETAILS[outing.sport].label}, ${miles(outing.distanceMeters)}, ${feet(outing.elevationGainMeters)} climbed, ${day(outing)}`,
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

    for (const city of COVERAGE_CITIES) {
      const coverage = streetCoverage[city];
      if (coverage.neighborhoods.some((hood) => hood.streetMeters > 0)) {
        sections.push(`## ${CITY_NAMES[city]} street coverage`, coverageLines(coverage));
      }
    }

    sections.push(relatedPageLinksMarkdown(activitiesRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return UNAVAILABLE_MARKDOWN;
  }
}
