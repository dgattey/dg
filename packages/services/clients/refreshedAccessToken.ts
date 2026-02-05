import 'server-only';
import { db } from '@dg/db';
import type { CreateTokenProps, FetchTokenProps } from '@dg/db/models/Token';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import type { RefreshTokenConfig, ValidatedToken } from './RefreshTokenConfig';

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
    accessToken,
    expiryAt,
    name,
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
    attributes: ['accessToken', 'refreshToken', 'expiryAt'],
    where: { name },
  });

  // Shouldn't happen unless invalid name, so it's a big error
  if (!token?.refreshToken) {
    log.error('Missing token', { name });
    throw new MissingTokenError(name);
  }

  // Return either refresh + access, or just refresh if invalid
  const { refreshToken, accessToken, expiryAt } = token;
  const isValid = expiryAt && Number(expiryAt) > Date.now();
  return { accessToken: isValid ? accessToken : null, refreshToken };
}

/**
 * When necessary, gets a new access token/refresh token from the API
 */
async function fetchRefreshedTokenFromApi(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
) {
  const { endpoint, headers, body, validate } = refreshTokenConfig;
  assertHttpsEndpoint(endpoint);
  const encodedBody = new URLSearchParams(body(refreshToken));
  log.info('Fetching refreshed token from API', {
    body: encodedBody,
    endpoint,
    headers,
  });

  const rawData = await fetch(endpoint, {
    body: encodedBody,
    headers,
    method: 'POST',
  });
  const data: unknown = await rawData.json();
  if (!rawData.ok) {
    // Log only status, not response data which could contain sensitive info
    log.error('Failed to fetch refreshed token', {
      name,
      status: rawData.status,
    });
    if ([400, 401, 403].includes(rawData.status)) {
      throw new MissingTokenError(name);
    }
    throw new TypeError('Token was not fetched properly');
  }
  log.info('Successfully refreshed token!', {
    status: rawData.status,
  });
  return validate(data, refreshToken);
}

/**
 * Refreshes a token using the API and persists it to the database.
 */
async function refreshTokenAndPersist(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
): Promise<ValidatedToken> {
  log.info('Fetching refreshed token', { name });
  const {
    refreshToken: newRefreshToken,
    accessToken,
    expiryAt,
  } = await fetchRefreshedTokenFromApi(name, refreshTokenConfig, refreshToken);
  log.info('Fetched refreshed token', { name });
  await createOrUpdateToken({ accessToken, expiryAt, name, refreshToken: newRefreshToken });
  log.info('Updated token in db, returning', { name });
  return { accessToken, expiryAt, refreshToken: newRefreshToken };
}

/**
 * Forces a token refresh and returns the updated token data.
 */
export async function forceRefreshTokenData(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
): Promise<ValidatedToken> {
  const currentData = await getLatestTokenIfValid({ name });
  return await refreshTokenAndPersist(name, refreshTokenConfig, currentData.refreshToken);
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
  log.info('Got latest token data', {
    accessToken: currentData.accessToken,
    forceRefresh,
    name,
    refreshToken: currentData.refreshToken,
  });
  if (currentData.accessToken && !forceRefresh) {
    return currentData.accessToken;
  }

  const { accessToken } = await refreshTokenAndPersist(
    name,
    refreshTokenConfig,
    currentData.refreshToken,
  );
  return accessToken;
}
