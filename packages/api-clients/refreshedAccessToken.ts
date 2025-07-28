import { log } from '@logtail/next';
import { db } from 'db';
import type { CreateTokenProps, FetchTokenProps } from 'db/models/Token';
import type { RefreshTokenConfig } from './RefreshTokenConfig';

/**
 * Creates or updates a possibly-existing token given a unique name and
 * access token/refresh token/expiry period.
 */
async function createOrUpdateToken({
  name,
  accessToken,
  expiryAt,
  refreshToken,
}: CreateTokenProps) {
  const token = await db.Token.upsert({
    name,
    accessToken,
    expiryAt,
    refreshToken,
  });
  return token[0];
}

/**
 * Gets a token if still valid/not expired. Throws an error if the token is
 * missing. Returns just the refresh token if invalid. Returns both the refresh
 * and access tokens if valid.
 */
async function getLatestTokenIfValid({ name }: FetchTokenProps) {
  const token = await db.Token.findOne({
    where: { name },
    attributes: ['accessToken', 'refreshToken', 'expiryAt'],
  });

  // Shouldn't happen unless invalid name, so it's a big error
  if (!token?.refreshToken) {
    throw new TypeError('Missing token');
  }

  // Return either refresh + access, or just refresh if invalid
  const { refreshToken, accessToken, expiryAt } = token;
  const isValid = expiryAt && Number(expiryAt) > Date.now();
  return { refreshToken, accessToken: isValid ? accessToken : null };
}

/**
 * When necessary, gets a new access token/refresh token from the API
 */
async function fetchRefreshedTokenFromApi(
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
) {
  const { endpoint, headers, body, validate } = refreshTokenConfig;
  const encodedBody = new URLSearchParams(body(refreshToken));
  log.info('Fetching refreshed token from API', {
    endpoint,
    headers,
    encodedBody: [...encodedBody],
  });

  const rawData = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: encodedBody,
  });
  const data: unknown = await rawData.json();
  if (!rawData.ok) {
    log.error('Failed to fetch refreshed token', {
      status: rawData.status,
      data,
    });
    throw new TypeError('Token was not fetched properly');
  }
  log.info('Successfully refreshed token!', {
    status: rawData.status,
  });
  return validate(data, refreshToken);
}

/**
 * Checks if our access token/key is still valid. If so, returns the access token.
 * Otherwise, grabs a new refresh/access token pair, updates the DB with the new
 * data, and returns the updated access token. May throw an error if something is
 * misconfigured. Should be caught higher up. If you force refresh, that means
 * it'll attempt to get a refreshed token even if the current token appears valid.
 * Should be used in case of 4xx codes from users.
 */
export async function refreshedAccessToken(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  forceRefresh?: boolean,
) {
  const currentData = await getLatestTokenIfValid({ name });
  log.info('Got latest token data', { currentData, forceRefresh });
  if (currentData.accessToken && !forceRefresh) {
    log.info('Returning current access token', { currentData });
    return currentData.accessToken;
  }

  // Grab a new token and save it
  log.info('Fetching refreshed token', { currentData });
  const { refreshToken, accessToken, expiryAt } = await fetchRefreshedTokenFromApi(
    refreshTokenConfig,
    currentData.refreshToken,
  );
  log.info('Fetched refreshed token', { refreshToken, accessToken, expiryAt });
  await createOrUpdateToken({ name, accessToken, refreshToken, expiryAt });
  log.info('Updated token in db, returning', {
    name,
    accessToken,
    refreshToken,
    expiryAt,
  });
  return accessToken;
}
