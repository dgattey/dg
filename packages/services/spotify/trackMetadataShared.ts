import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import type * as v from 'valibot';
import { parseResponse } from '../clients/parseResponse';
import { getSpotifyClient } from './spotifyClient';

const FETCH_CONCURRENCY = 5;
const FETCH_THROTTLE_MS = 100;

/**
 * Metadata needed to create a SpotifyPlay row.
 */
export type TrackMetadata = {
  albumId: string;
  artistIds: Array<string>;
};

/**
 * Selects the best album image (prefers 640px width, falls back to first).
 */
export function bestSpotifyImage(
  images: ReadonlyArray<{ height?: number | null; url: string; width?: number | null }>,
): string {
  const preferred = images.find((img) => img.width === 640) ?? images[0];
  return preferred?.url ?? '';
}

/**
 * Promise-based sleep utility for throttling API requests.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs an async lookup across items in throttled batches, dropping rejected or null results.
 */
export async function mapInBatches<T, R>(
  items: ReadonlyArray<T>,
  fn: (item: T) => Promise<R | null>,
  options?: { concurrency?: number; throttleMs?: number },
): Promise<Array<R>> {
  const concurrency = options?.concurrency ?? FETCH_CONCURRENCY;
  const throttleMs = options?.throttleMs ?? FETCH_THROTTLE_MS;
  const results: Array<R> = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(fn));
    for (const item of settled) {
      if (item.status === 'fulfilled' && item.value !== null) {
        results.push(item.value);
      }
    }
    if (i + concurrency < items.length) {
      await sleep(throttleMs);
    }
  }
  return results;
}

/**
 * Result of a Spotify API request.
 */
export type SpotifyRequestResult<T> =
  | { success: true; data: T; status: 200 }
  | { error: string; retryAfterSeconds?: number; status: number; success: false };

let cachedAppToken: { expiresAt: number; token: string } | null = null;
let userTokenUnavailable = false;

async function getClientCredentialsToken(): Promise<string | null> {
  if (cachedAppToken && cachedAppToken.expiresAt > Date.now()) {
    return cachedAppToken.token;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    body: 'grant_type=client_credentials',
    cache: 'no-store',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  if (!res.ok) {
    return null;
  }
  const payload = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) {
    return null;
  }
  cachedAppToken = {
    expiresAt: Date.now() + ((payload.expires_in ?? 3600) - 60) * 1000,
    token: payload.access_token,
  };
  return payload.access_token;
}

async function fetchPublicCatalogResource<T>(
  resource: string,
  schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
  context: string,
): Promise<SpotifyRequestResult<T> | null> {
  const publicResource = resource.replace(
    /^me\/playlists(?=\/|\?|$)/,
    'users/dylangattey/playlists',
  );
  if (!/^(?:(?:tracks|albums|artists|playlists|users)(?:\/|\?)|search\?)/.test(publicResource)) {
    return null;
  }
  const token = await getClientCredentialsToken();
  if (!token) {
    return null;
  }
  const res = await fetch(`https://api.spotify.com/v1/${publicResource}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) {
    const rawRetryAfter = res.headers?.get?.('retry-after');
    const parsedRetryAfter = rawRetryAfter ? Number.parseInt(rawRetryAfter, 10) : Number.NaN;
    const retryAfterSeconds =
      Number.isFinite(parsedRetryAfter) && parsedRetryAfter >= 0 ? parsedRetryAfter : undefined;
    return {
      error: `HTTP ${res.status}`,
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
      status: res.status,
      success: false,
    };
  }
  const data = parseResponse(schema, await res.json(), {
    kind: 'rest',
    source: `spotify.${context}`,
  });
  return { data, status: 200, success: true };
}

/**
 * Makes a GET request to Spotify and validates the payload.
 *
 * Deliberately does not retry. Every caller is on a page render, and sleeping
 * through a rate limit while a visitor waits is never the right trade — an
 * earlier backoff ladder here made `/music/albums` hang for 51 seconds before
 * showing an empty page. Rate limits are absorbed by caching the successful
 * result and by falling back to stored data, not by waiting.
 */
export async function spotifyGet<T>(
  resource: string,
  schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
  context: string,
): Promise<SpotifyRequestResult<T>> {
  if (process.env.NODE_ENV !== 'test' && userTokenUnavailable) {
    const fallback = await fetchPublicCatalogResource(resource, schema, context);
    if (fallback) {
      return fallback;
    }
  }
  try {
    const { response, retryAfterSeconds, status } = await getSpotifyClient().get(resource);

    if (status !== 200) {
      if (status === 429) {
        log.warn(`Spotify rate limited (${context})`, { resource, retryAfterSeconds });
      }
      return {
        error: `HTTP ${status}`,
        ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
        status,
        success: false,
      };
    }

    const data = parseResponse(schema, await response.json(), {
      kind: 'rest',
      source: `spotify.${context}`,
    });
    return { data, status: 200, success: true };
  } catch (error) {
    if (isMissingTokenError(error)) {
      if (process.env.NODE_ENV !== 'test') {
        userTokenUnavailable = true;
      }
      const fallback = await fetchPublicCatalogResource(resource, schema, context);
      if (fallback) {
        return fallback;
      }
    }
    throw error;
  }
}
