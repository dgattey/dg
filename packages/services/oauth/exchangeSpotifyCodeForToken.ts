import 'server-only';

import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { isRecord } from '@dg/shared-core/types/typeguards';
import { createExpirationDate } from '../spotify/spotifyClient';

const SPOTIFY_TOKEN_NAME = 'spotify';

/**
 * Exchanges a Spotify authorization code for an access token and persists it.
 * Supports PKCE by accepting an optional code verifier.
 */
export async function exchangeSpotifyCodeForToken(
  code: string,
  codeVerifier?: string,
): Promise<string> {
  const callbackUrl = process.env.OAUTH_CALLBACK_URL;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  invariant(callbackUrl, 'Missing OAUTH_CALLBACK_URL env variable');
  invariant(clientId, 'Missing SPOTIFY_CLIENT_ID env variable');

  log.info('Exchanging code for token for Spotify', { code, hasPkce: !!codeVerifier });

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

  if (!isRecord(rawTokenData)) {
    throw new Error('Invalid Spotify token response');
  }

  const tokenType = rawTokenData.token_type;
  const accessToken = rawTokenData.access_token;
  const refreshToken = rawTokenData.refresh_token;
  const expiresIn = rawTokenData.expires_in;

  if (tokenType !== 'Bearer') {
    throw new Error(`Invalid token type from Spotify ${String(tokenType)}`);
  }
  if (typeof accessToken !== 'string') {
    throw new Error('Missing access token from Spotify');
  }
  if (typeof refreshToken !== 'string') {
    throw new Error('Missing refresh token from Spotify');
  }
  if (typeof expiresIn !== 'number') {
    throw new Error('Missing expires_in from Spotify');
  }

  const expiryAt = createExpirationDate(expiresIn);

  log.info('Persisting token to DB', { accessToken, expiryAt, refreshToken });
  const [token] = await db.Token.upsert({
    accessToken,
    expiryAt,
    name: SPOTIFY_TOKEN_NAME,
    refreshToken,
  });
  log.info('Persisted token to DB', { updatedAt: token.updatedAt });

  return `
    <p>Success! Token persisted to ${SPOTIFY_TOKEN_NAME} and expires at ${expiryAt.toLocaleString()}</p>`;
}
