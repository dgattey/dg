import 'server-only';

import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { validateRawDataToToken } from '../strava/stravaClient';
import { stravaTokenExchangeClient } from '../strava/stravaTokenExchangeClient';

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
invariant(CALLBACK_URL, 'Missing OAUTH_CALLBACK_URL env variable');
invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');
invariant(CLIENT_SECRET, 'Missing STRAVA_CLIENT_SECRET env variable');

/**
 * Exchanges a Strava authorization code for an access token and persists it.
 */
export async function exchangeStravaCodeForToken(code: string): Promise<string> {
  log.info('Exchanging code for token for Strava', { code });
  const response = await stravaTokenExchangeClient
    .json({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    })
    .post('')
    .res();

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

  return `
    <p>Success! Token persisted to 'strava' and expires at ${expiryAt.toLocaleString()}</p>`;
}
