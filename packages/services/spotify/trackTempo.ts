import 'server-only';

import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import { fetchTrackBpm, isIsrc } from './fetchTrackBpm';

/**
 * A failed lookup (timeout, outage, or quota) is retried once it is this old.
 */
export const TRACK_TEMPO_RETRY_MS = 60 * 60 * 1000;

type KnownTempo = { bpm: number | null; expiresAt: number };

const knownTempos = new Map<string, KnownTempo>();
const inFlightTempos = new Map<string, Promise<number | null>>();

export function clearTrackTempoMemo(): void {
  knownTempos.clear();
  inFlightTempos.clear();
}

function remember(isrc: string, bpm: number | null, expiresAt = Number.POSITIVE_INFINITY) {
  knownTempos.set(isrc, { bpm, expiresAt });
  return bpm;
}

async function readThroughTrackBpm(isrc: string): Promise<number | null> {
  const stored = await db.MusicTrackTempo.findByPk(isrc);
  if (stored && stored.status !== 'failed') {
    return remember(isrc, stored.bpm);
  }
  if (stored) {
    const retryAt = stored.checkedAt.getTime() + TRACK_TEMPO_RETRY_MS;
    if (retryAt > Date.now()) {
      return remember(isrc, null, retryAt);
    }
  }

  const checkedAt = new Date();
  let bpm: number | null;
  try {
    bpm = await fetchTrackBpm(isrc);
  } catch (error) {
    log.warn('Track tempo lookup failed; retrying in an hour', { error, isrc });
    await db.MusicTrackTempo.upsert({ bpm: null, checkedAt, isrc, status: 'failed' });
    return remember(isrc, null, checkedAt.getTime() + TRACK_TEMPO_RETRY_MS);
  }
  await db.MusicTrackTempo.upsert({
    bpm,
    checkedAt,
    isrc,
    status: bpm === null ? 'missing' : 'found',
  });
  return remember(isrc, bpm);
}

/**
 * Tempo for a recording, read from `MusicTrackTempo` first. Deezer is asked
 * only when nothing is stored yet or a failed lookup is over an hour old, and
 * its answer, including "no tempo", is stored for good since a recording's
 * tempo never changes. Answers are also remembered per server instance so
 * Now Playing polls skip Postgres for a song they already resolved.
 */
export async function getTrackBpm(rawIsrc: string): Promise<number | null> {
  const isrc = rawIsrc.toUpperCase();
  if (!isIsrc(isrc)) {
    return null;
  }
  const known = knownTempos.get(isrc);
  if (known && known.expiresAt > Date.now()) {
    return known.bpm;
  }
  const inFlight = inFlightTempos.get(isrc);
  if (inFlight) {
    return await inFlight;
  }
  const request = readThroughTrackBpm(isrc).finally(() => {
    inFlightTempos.delete(isrc);
  });
  inFlightTempos.set(isrc, request);
  return await request;
}
