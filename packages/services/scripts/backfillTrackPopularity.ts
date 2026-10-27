/**
 * Gives every played track that has no popularity snapshot today's Spotify
 * popularity (Deezer rank when Spotify has none), waiting out rate limits.
 * History syncs fill these in a slice at a time; this does them all at once.
 *
 * Usage:
 *   pnpm exec turbo spotify:popularity
 */
import 'server-only';

import { closeDbConnection } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { sleep } from '../spotify/trackMetadataShared';
import { captureTrackPopularity, selectTracksMissingPopularity } from '../spotify/trackPopularity';
import { revalidateRemoteSpotify } from './revalidateRemoteSpotify';

const TRACKS_PER_PASS = 1_000;
const MAX_ATTEMPTS_PER_PASS = 5;
const DEFAULT_RETRY_SECONDS = 30;

const missing = await selectTracksMissingPopularity();
log.info('Backfilling track popularity', { tracks: missing.length });

const totals = { deezer: 0, spotify: 0 };
for (let i = 0; i < missing.length; i += TRACKS_PER_PASS) {
  const pass = missing.slice(i, i + TRACKS_PER_PASS);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PASS; attempt++) {
    const result = await captureTrackPopularity(pass);
    totals.deezer += result.deezer;
    totals.spotify += result.spotify;
    if (!result.stoppedEarly) {
      break;
    }
    const waitSeconds = result.retryAfterSeconds ?? DEFAULT_RETRY_SECONDS;
    log.warn('Spotify stopped the popularity backfill; waiting before retrying', {
      attempt,
      waitSeconds,
    });
    await sleep(waitSeconds * 1000);
  }
  log.info('Track popularity backfill progress', {
    ...totals,
    done: Math.min(i + TRACKS_PER_PASS, missing.length),
    tracks: missing.length,
  });
}

const unscored = (await selectTracksMissingPopularity()).length;
await closeDbConnection();
if (totals.deezer + totals.spotify > 0) {
  await revalidateRemoteSpotify('popularity backfill');
}
log.info('Track popularity backfill finished', { ...totals, unscored });
