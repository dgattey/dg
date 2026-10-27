import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { isRecord } from '@dg/shared-core/types/typeguards';

/**
 * Tempo range that half- and double-time readings fold into, so a 60 BPM
 * ballad and a 240 BPM drum-and-bass track both bounce at a readable pace.
 */
export const MIN_BPM = 70;
export const MAX_BPM = 180;

const DEEZER_TRACK_ENDPOINT = 'https://api.deezer.com/track/';
const DEEZER_NO_DATA_ERROR_CODE = 800;
const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/i;

/**
 * Deezer usually answers in 100–300ms; past this the lookup gives up so a slow
 * Deezer adds at most this much to a song's first Now Playing read.
 */
export const DEEZER_TIMEOUT_MS = 800;

/**
 * Folds a raw tempo into `MIN_BPM..MAX_BPM` by doubling or halving.
 * Returns null for anything that is not a positive finite number, since
 * Deezer reports an unknown tempo as `0`.
 */
export function normalizeBpm(bpm: unknown): number | null {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) {
    return null;
  }
  let normalized = bpm;
  while (normalized < MIN_BPM) {
    normalized *= 2;
  }
  while (normalized > MAX_BPM) {
    normalized /= 2;
  }
  return Math.round(normalized * 100) / 100;
}

/**
 * Looks up a track's tempo on Deezer's keyless public API by ISRC, because
 * Spotify's audio-features endpoint is closed to apps created after Nov 2024.
 * Resolves null when Deezer has no tempo for the track, and throws on network,
 * HTTP, quota, or timeout failures so callers can cache those only briefly.
 */
export async function fetchTrackBpm(isrc: string): Promise<number | null> {
  if (!ISRC_PATTERN.test(isrc)) {
    return null;
  }
  const response = await fetch(`${DEEZER_TRACK_ENDPOINT}isrc:${isrc.toUpperCase()}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(DEEZER_TIMEOUT_MS),
  });
  invariant(response.ok, `Deezer track lookup failed with status ${response.status}`);
  const data: unknown = await response.json();
  invariant(isRecord(data), 'Invalid Deezer track response');
  if (isRecord(data.error)) {
    invariant(
      data.error.code === DEEZER_NO_DATA_ERROR_CODE,
      `Deezer track lookup failed with error ${String(data.error.code)}`,
    );
    return null;
  }
  return normalizeBpm(data.bpm);
}
