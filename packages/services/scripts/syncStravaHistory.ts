/**
 * Backfills every Strava activity into the database `DATABASE_URL` points at.
 * Run with `turbo strava:backfill`; rerunning is safe and resumes after a rate limit.
 */
import { log } from '@dg/shared-core/logging/log';
import { syncStravaHistory } from '../strava/syncStravaHistory';

const outcome = await syncStravaHistory();
log.info('Strava backfill finished', outcome);
process.exit(outcome.status === 'ok' ? 0 : 1);
