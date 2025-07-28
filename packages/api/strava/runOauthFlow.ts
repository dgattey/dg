import { log } from '@logtail/next';
import { db } from 'db';
import { invariant } from 'shared-core/helpers/invariant';
import { validateRawDataToToken } from './stravaClient';
import { stravaTokenExchangeClient } from './stravaTokenExchangeClient';

const CALLBACK_URL = process.env.WEBHOOK_CALLBACK_URL;
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_TOKEN_NAME = process.env.STRAVA_TOKEN_NAME;
invariant(CALLBACK_URL, 'Missing WEBHOOK_CALLBACK_URL env variable');
invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');
invariant(CLIENT_SECRET, 'Missing STRAVA_CLIENT_SECRET env variable');

/**
 * Just a state token to confirm types between the OAuth flow and the callback
 */
export const OAUTH_STATE_TYPE = 'stravaOauthFlow';

/**
 * Used to start the oauth flow for Strava. The URL returned by this
 * function needs to be opened in browser for the user to start the
 * flow manually.
 */
export function getOauthTokenInitLink() {
  invariant(CALLBACK_URL, 'Missing WEBHOOK_CALLBACK_URL env variable');
  invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('grant_type', 'authorization_code');
  url.searchParams.append('redirect_uri', CALLBACK_URL);
  url.searchParams.append('state', OAUTH_STATE_TYPE);
  url.searchParams.append('scope', 'read,activity:read_all,profile:read_all,read_all');
  return url.toString();
}

/**
 * Confirms a query record is properly formatted to exchange a code for a token, pulling out the token.
 */
export function getStravaExchangeCodeForTokenRequest(
  query: Partial<Record<string, string | Array<string>>>,
): string | null {
  if (
    query.state === OAUTH_STATE_TYPE &&
    typeof query.code === 'string' &&
    typeof query.scope === 'string'
  ) {
    return query.code;
  }
  return null;
}

/**
 * Assuming the user has gone through the Strava OAuth flow and
 * permitted use via the url from `getOauthTokenInitLink`, this
 * uses the callback data to get a token by giving back the code.
 * Returns HTML to pass back to the client.
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  log.info('Exchanging code for token for Strava', { code });
  const response = await stravaTokenExchangeClient
    .json({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
    })
    .post('')
    .res();

  log.info('Got token response', { response });
  const { accessToken, expiryAt, refreshToken } = validateRawDataToToken(await response.json());

  // Persist the refreshToken and accessToken from the response to the DB
  invariant(STRAVA_TOKEN_NAME, 'Missing STRAVA_TOKEN_NAME env variable');
  log.info('Persisting token to DB', { accessToken, expiryAt, refreshToken });
  const [token] = await db.Token.upsert({
    name: STRAVA_TOKEN_NAME,
    accessToken,
    expiryAt,
    refreshToken,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  log.info('Persisted token to DB', { updatedAt: token.updatedAt });

  return `
    <p>Success! Token persisted to ${STRAVA_TOKEN_NAME} and expires at ${expiryAt.toLocaleString()}</p>`;
}
