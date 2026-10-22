import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import {
  mapStravaActivityFromApi,
  stravaActivityApiSchema,
} from '@dg/content-models/strava/StravaActivity';
import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { array } from 'valibot';
import { parseResponse } from '../clients/parseResponse';
import { parseStoredStravaActivity } from './parseStoredStravaActivity';
import { getStravaClient } from './stravaClient';

/** Strava's largest `per_page` for the athlete activities list. */
const PAGE_SIZE = 200;

const activityPageSchema = array(stravaActivityApiSchema);

type SyncCounts = { inserted: number; pages: number; updated: number };

export type StravaHistorySyncOutcome =
  | (SyncCounts & { status: 'ok' })
  | (SyncCounts & { reason: string; retryAfterSeconds?: number; status: 'failed' });

const keepOrFill = (stored?: string | null, summary?: string | null) => stored || summary || stored;

/**
 * The list endpoint returns summaries, so a stored row (often a detailed
 * `activities/:id` payload) only takes the route, sport, and gear it lacks.
 * Null when there is nothing to fill.
 */
const fillSummaryGaps = (
  stored: StravaActivity,
  summary: StravaActivity,
): StravaActivity | null => {
  const summaryPolyline = keepOrFill(stored.map?.summaryPolyline, summary.map?.summaryPolyline);
  const sportType = keepOrFill(stored.sportType, summary.sportType);
  const gearId = keepOrFill(stored.gearId, summary.gearId);
  if (
    summaryPolyline === stored.map?.summaryPolyline &&
    sportType === stored.sportType &&
    gearId === stored.gearId
  ) {
    return null;
  }
  return { ...stored, gearId, map: { ...stored.map, summaryPolyline }, sportType };
};

const savePage = async (summaries: ReadonlyArray<StravaActivity>) => {
  const existingRows = await db.StravaActivity.findAll({
    attributes: ['id', 'activityData', 'activityStartDate'],
    where: { id: summaries.map((summary) => summary.id) },
  });
  // pg returns BIGINT columns as strings
  const existingById = new Map(existingRows.map((row) => [Number(row.id), row]));

  const newRows = summaries.flatMap((summary) =>
    !existingById.has(summary.id) && summary.startDate
      ? [
          {
            activityData: summary,
            activityStartDate: new Date(summary.startDate),
            id: summary.id,
          },
        ]
      : [],
  );
  await db.StravaActivity.bulkCreate(newRows, { ignoreDuplicates: true });

  let updated = 0;
  for (const summary of summaries) {
    const row = existingById.get(summary.id);
    const stored = row && parseStoredStravaActivity(row.activityData, row.activityStartDate);
    const filled = stored && fillSummaryGaps(stored, summary);
    if (filled) {
      await db.StravaActivity.update({ activityData: filled }, { where: { id: summary.id } });
      updated += 1;
    }
  }
  return { inserted: newRows.length, updated };
};

const stopped = (
  counts: SyncCounts,
  reason: string,
  retryAfterSeconds?: number,
): StravaHistorySyncOutcome => {
  log.warn('Stopped Strava history sync', { ...counts, reason, retryAfterSeconds });
  return { ...counts, reason, retryAfterSeconds, status: 'failed' };
};

/**
 * Pages through every activity on the athlete's account and stores the ones
 * the webhook never saw. Rows that already exist keep their data and only gain
 * missing summary fields, so a second run changes nothing. Stops at the first
 * rate limit or error; rows saved before that stay saved.
 */
export const syncStravaHistory = async (): Promise<StravaHistorySyncOutcome> => {
  const counts: SyncCounts = { inserted: 0, pages: 0, updated: 0 };
  let pageLength = PAGE_SIZE;
  while (pageLength === PAGE_SIZE) {
    const page = counts.pages + 1;
    const { response, retryAfterSeconds, status } = await getStravaClient().get(
      `athlete/activities?per_page=${PAGE_SIZE}&page=${page}`,
    );
    if (status === 429) {
      return stopped(counts, `Strava rate limit reached on page ${page}`, retryAfterSeconds);
    }
    if (status !== 200) {
      return stopped(counts, `Strava returned ${status} for page ${page}`);
    }
    const summaries = parseResponse(activityPageSchema, await response.json(), {
      kind: 'rest',
      source: 'strava.syncStravaHistory',
    }).map(mapStravaActivityFromApi);
    const saved = await savePage(summaries);
    counts.inserted += saved.inserted;
    counts.updated += saved.updated;
    counts.pages = page;
    pageLength = summaries.length;
  }
  log.info('Synced Strava history', counts);
  return { ...counts, status: 'ok' };
};
