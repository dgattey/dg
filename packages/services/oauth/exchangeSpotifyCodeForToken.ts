import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { upsertAndCacheToken } from '../clients/refreshedAccessToken';
import { validateSpotifyTokenResponse } from '../spotify/spotifyClient';

const SPOTIFY_TOKEN_NAME = 'spotify';

/**
 * Exchanges a Spotify authorization code for an access token and persists it.
 * Supports PKCE by accepting an optional code verifier.
 */
export async function exchangeSpotifyCodeForToken(
  code: string,
  codeVerifier?: string,
): Promise<void> {
  const callbackUrl = process.env.OAUTH_CALLBACK_URL;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  invariant(callbackUrl, 'Missing OAUTH_CALLBACK_URL env variable');
  invariant(clientId, 'Missing SPOTIFY_CLIENT_ID env variable');

  log.info('Exchanging code for token for Spotify', {
    code,
    hasPkce: !!codeVerifier,
  });

  if (!codeVerifier) {
    throw new Error('Missing code verifier for Spotify PKCE flow');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: callbackUrl,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    body,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const rawTokenData: unknown = await response.json();
  log.info('Got token response', { status: response.status });

  if (!response.ok) {
    log.error('Failed to exchange Spotify code for token', {
      data: rawTokenData,
      status: response.status,
    });
    throw new Error('Failed to exchange Spotify code for token');
  }

  const { accessToken, expiryAt, refreshToken } = validateSpotifyTokenResponse(rawTokenData);

  log.info('Persisting token to DB', { accessToken, expiryAt, refreshToken });
  const token = await upsertAndCacheToken({
    accessToken,
    expiryAt,
    name: SPOTIFY_TOKEN_NAME,
    refreshToken,
  });
  log.info('Persisted token to DB', { updatedAt: token.updatedAt });
}
