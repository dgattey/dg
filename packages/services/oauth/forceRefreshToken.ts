import 'server-only';

import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import type { ForceRefreshResult, OauthProvider } from './types';

/**
 * Grace period for Spotify token expiry (30 seconds early).
 */
const GRACE_PERIOD_IN_MS = 30_000;

/**
 * Strava refresh token response shape.
 */
type StravaRefreshResponse = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

/**
 * Spotify refresh token response shape.
 */
type SpotifyRefreshResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
};

type RefreshConfig = {
  endpoint: string;
  headers: Record<string, string>;
  body: (refreshToken: string) => Record<string, string>;
  validate: (
    data: unknown,
    existingRefresh: string,
  ) => {
    accessToken: string;
    refreshToken: string;
    expiryAt: Date;
  };
};

/**
 * Gets the refresh token configuration for a provider.
 */
function getRefreshConfig(provider: OauthProvider): RefreshConfig {
  if (provider === 'strava') {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    invariant(clientId, 'Missing STRAVA_CLIENT_ID env variable');
    invariant(clientSecret, 'Missing STRAVA_CLIENT_SECRET env variable');

    return {
      body: (refreshToken: string) => ({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      endpoint: 'https://www.strava.com/api/v3/oauth/token',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      validate: (data: unknown, _existingRefresh: string) => {
        const response = data as StravaRefreshResponse;
        return {
          accessToken: response.access_token,
          expiryAt: new Date(response.expires_at * 1000),
          refreshToken: response.refresh_token,
        };
      },
    };
  }

  // Spotify
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  invariant(clientId, 'Missing SPOTIFY_CLIENT_ID env variable');
  invariant(clientSecret, 'Missing SPOTIFY_CLIENT_SECRET env variable');

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  return {
    body: (refreshToken: string) => ({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    endpoint: 'https://accounts.spotify.com/api/token/',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validate: (data: unknown, existingRefresh: string) => {
      const response = data as SpotifyRefreshResponse;
      return {
        accessToken: response.access_token,
        expiryAt: new Date(Date.now() - GRACE_PERIOD_IN_MS + response.expires_in * 1000),
        // Spotify doesn't return a new refresh token, keep existing
        refreshToken: existingRefresh,
      };
    },
  };
}

/**
 * Forces a refresh of the OAuth token for the given provider.
 *
 * @param provider - The OAuth provider to refresh token for
 */
export async function forceRefreshToken(provider: OauthProvider): Promise<ForceRefreshResult> {
  try {
    const config = getRefreshConfig(provider);

    // Get current token
    const token = await db.Token.findOne({
      attributes: ['accessToken', 'expiryAt', 'refreshToken'],
      where: { name: provider },
    });

    if (!token?.refreshToken) {
      return { error: 'No refresh token found. Please re-authenticate.', success: false };
    }

    log.info('Force refreshing token', { provider });

    // Call the refresh endpoint
    const body = new URLSearchParams(config.body(token.refreshToken));
    const response = await fetch(config.endpoint, {
      body,
      headers: config.headers,
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.text();
      log.error('Failed to refresh token', { errorData, provider, status: response.status });
      return { error: `Refresh failed: ${response.status}`, success: false };
    }

    const data = await response.json();
    const validated = config.validate(data, token.refreshToken);

    const previousAccessToken = token.accessToken ?? null;
    const previousExpiryAt = token.expiryAt ?? null;
    const previousRefreshToken = token.refreshToken ?? null;
    const newExpiryAt = validated.expiryAt;
    const previousExpiryAtIso = previousExpiryAt?.toISOString() ?? null;
    const newExpiryAtIso = Number.isNaN(newExpiryAt.getTime()) ? null : newExpiryAt.toISOString();

    log.info('Refreshed token successfully', {
      accessTokenRotated:
        previousAccessToken !== null ? validated.accessToken !== previousAccessToken : null,
      expiryExtended:
        previousExpiryAt !== null && newExpiryAtIso !== null
          ? newExpiryAt > previousExpiryAt
          : null,
      newExpiryAtIso,
      previousExpiryAtIso,
      provider,
      refreshTokenRotated:
        previousRefreshToken !== null ? validated.refreshToken !== previousRefreshToken : null,
    });

    // Save refreshed token
    await db.Token.upsert({
      accessToken: validated.accessToken,
      expiryAt: validated.expiryAt,
      name: provider,
      refreshToken: validated.refreshToken,
    });

    log.info('Saved refreshed token to database', { provider });

    return { expiresAt: validated.expiryAt, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error force refreshing token', { error: message, provider });
    return { error: message, success: false };
  }
}
