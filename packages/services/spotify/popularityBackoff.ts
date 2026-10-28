import 'server-only';

import { db } from '@dg/db';

/** Why a popularity capture stopped: Spotify's status, or no status when a request or write threw. */
export type PopularityFailure = { retryAfterSeconds?: number; status?: number };

/** Shortest pause, so `Retry-After: 0` never retries on the very next sync. */
const MIN_PAUSE_MS = 60_000;
/** The first failure's pause ceiling, about one sync interval; each further failure doubles it. */
const BASE_PAUSE_MS = 15 * 60_000;
/** Longest pause, so a persistent outage costs about four calls a day. */
export const MAX_PAUSE_MS = 6 * 60 * 60_000;

const BACKOFF_NAME = 'spotify:track-popularity';

/**
 * How long syncs leave popularity alone after the `failures`th refused run in
 * a row. Spotify's Retry-After wins, held to the minimum; otherwise the pause
 * doubles per failure up to the maximum, with equal jitter so retries spread
 * out. A 4xx other than 429 won't clear by retrying, so it waits the maximum.
 */
export function popularityPauseMs(
  failure: PopularityFailure,
  failures: number,
  random: () => number = Math.random,
): number {
  const { retryAfterSeconds, status } = failure;
  if (status !== undefined && status >= 400 && status < 500 && status !== 429) {
    return MAX_PAUSE_MS;
  }
  if (retryAfterSeconds !== undefined) {
    return Math.max(MIN_PAUSE_MS, retryAfterSeconds * 1000);
  }
  const ceiling = Math.min(MAX_PAUSE_MS, BASE_PAUSE_MS * 2 ** Math.max(0, failures - 1));
  return Math.max(MIN_PAUSE_MS, Math.round(ceiling / 2 + random() * (ceiling / 2)));
}

/** When syncs may call Spotify for popularity again, or null when they may now. */
export async function readPopularityPause(now: Date = new Date()): Promise<Date | null> {
  const backoff = await db.SyncBackoff.findByPk(BACKOFF_NAME);
  return backoff && backoff.retryAt > now ? backoff.retryAt : null;
}

/** Clears the pause after a clean run, or extends it after a refused one. */
export async function recordPopularityOutcome(
  failure: PopularityFailure | undefined,
  now: Date = new Date(),
  random: () => number = Math.random,
): Promise<void> {
  if (!failure) {
    await db.SyncBackoff.destroy({ where: { name: BACKOFF_NAME } });
    return;
  }
  const failures = ((await db.SyncBackoff.findByPk(BACKOFF_NAME))?.failures ?? 0) + 1;
  await db.SyncBackoff.upsert({
    failures,
    name: BACKOFF_NAME,
    retryAt: new Date(now.getTime() + popularityPauseMs(failure, failures, random)),
  });
}
