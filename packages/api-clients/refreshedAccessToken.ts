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
  const token = await db.Token.upsert({ name, accessToken, expiryAt, refreshToken });
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
  const { endpoint, headers, data, validate } = refreshTokenConfig;

  const rawData = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...headers,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      ...data,
    }),
  });
  if (!rawData.ok) {
    throw new TypeError('Token was not fetched properly');
  }
  return validate(await rawData.json(), refreshToken);
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
  if (currentData.accessToken && !forceRefresh) {
    return currentData.accessToken;
  }

  // Grab a new token and save it
  const { refreshToken, accessToken, expiryAt } = await fetchRefreshedTokenFromApi(
    refreshTokenConfig,
    currentData.refreshToken,
  );
  await createOrUpdateToken({ name, accessToken, refreshToken, expiryAt });
  return accessToken;
}