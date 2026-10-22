import 'server-only';

import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { validateRawDataToToken } from '../strava/stravaClient';

/**
 * Exchanges a Strava authorization code for an access token and persists it.
 */
export async function exchangeStravaCodeForToken(code: string): Promise<void> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  invariant(clientId, 'Missing STRAVA_CLIENT_ID env variable');
  invariant(clientSecret, 'Missing STRAVA_CLIENT_SECRET env variable');

  log.info('Exchanging code for token for Strava', { code });
  const response = await fetch('https://www.strava.com/oauth/token', {
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to exchange Strava code for token: ${response.status}`);
  }

  const rawTokenData = await response.json();
  log.info('Got token response', { status: response.status });
  const { accessToken, expiryAt, refreshToken } = validateRawDataToToken(rawTokenData);

  log.info('Persisting token to DB', { accessToken, expiryAt, refreshToken });
  const [token] = await db.Token.upsert({
    accessToken,
    expiryAt,
    name: 'strava',
    refreshToken,
  });
  log.info('Persisted token to DB', { updatedAt: token.updatedAt });
}
