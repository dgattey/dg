import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { log } from '@dg/shared-core/helpers/log';
import { maskSecret } from '@dg/shared-core/helpers/maskSecret';
import { validateRawDataToToken } from './stravaClient';
import { stravaTokenExchangeClient } from './stravaTokenExchangeClient';

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
invariant(CALLBACK_URL, 'Missing OAUTH_CALLBACK_URL env variable');
invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');
invariant(CLIENT_SECRET, 'Missing STRAVA_CLIENT_SECRET env variable');

/**
 * Just a state token to confirm types between the OAuth flow and the callback
 */
export const OAUTH_STATE_TYPE = 'stravaOauthFlow';

type OauthLinkOptions = {
  /**
   * When true, forces the consent dialog to show even if already authorized.
   * Useful for re-authenticating or switching accounts.
   */
  forceDialog?: boolean;
};

/**
 * Used to start the oauth flow for Strava. The URL returned by this
 * function needs to be opened in browser for the user to start the
 * flow manually.
 */
export function getOauthTokenInitLink({ forceDialog = false }: OauthLinkOptions = {}) {
  invariant(CALLBACK_URL, 'Missing OAUTH_CALLBACK_URL env variable');
  invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('grant_type', 'authorization_code');
  url.searchParams.append('redirect_uri', CALLBACK_URL);
  url.searchParams.append('state', OAUTH_STATE_TYPE);
  url.searchParams.append('scope', 'read,activity:read_all,profile:read_all,read_all');
  if (forceDialog) {
    url.searchParams.append('approval_prompt', 'force');
  }
  return url.toString();
}

/**
 * Assuming the user has gone through the Strava OAuth flow and
 * permitted use via the url from `getOauthTokenInitLink`, this
 * uses the callback data to get a token by giving back the code.
 * Returns HTML to pass back to the client.
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  log.info('Exchanging code for token for Strava', { code: maskSecret(code) });
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

  // Persist the refreshToken and accessToken from the response to the DB
  log.info('Persisting token to DB', {
    accessToken: maskSecret(accessToken),
    expiryAt,
    refreshToken: maskSecret(refreshToken),
  });
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
