import 'server-only';
import { db } from '@dg/db';
import type { CreateTokenProps, FetchTokenProps } from '@dg/db/models/Token';
import { log } from '@dg/shared-core/helpers/log';
import { maskSecret } from './maskSecret';
import type { RefreshTokenConfig } from './RefreshTokenConfig';

const maskIfSensitive = (key: string, value: string) => {
  const normalized = key.toLowerCase();
  if (
    normalized.includes('authorization') ||
    normalized.includes('token') ||
    normalized.includes('secret')
  ) {
    return maskSecret(value) ?? value;
  }
  return value;
};

const maskHeaders = (headers: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, maskIfSensitive(key, value)]),
  );

const maskBodyEntries = (entries: Array<[string, string]>) =>
  entries.map(([key, value]) => [key, maskIfSensitive(key, value)]);

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
    throw new TypeError('Missing token');
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
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
) {
  const { endpoint, headers, body, validate } = refreshTokenConfig;
  const encodedBody = new URLSearchParams(body(refreshToken));
  log.info('Fetching refreshed token from API', {
    encodedBody: maskBodyEntries([...encodedBody]),
    endpoint,
    headers: maskHeaders(headers),
  });

  const rawData = await fetch(endpoint, {
    body: encodedBody,
    headers,
    method: 'POST',
  });
  const data: unknown = await rawData.json();
  if (!rawData.ok) {
    log.error('Failed to fetch refreshed token', {
      data,
      status: rawData.status,
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
  const maskedCurrentData = {
    accessToken: maskSecret(currentData.accessToken),
    refreshToken: maskSecret(currentData.refreshToken),
  };
  log.info('Got latest token data', {
    currentData: maskedCurrentData,
    forceRefresh,
    name,
  });
  if (currentData.accessToken && !forceRefresh) {
    return currentData.accessToken;
  }

  // Grab a new token and save it
  log.info('Fetching refreshed token', { name });
  const { refreshToken, accessToken, expiryAt } = await fetchRefreshedTokenFromApi(
    refreshTokenConfig,
    currentData.refreshToken,
  );
  log.info('Fetched refreshed token', { name });
  await createOrUpdateToken({ accessToken, expiryAt, name, refreshToken });
  log.info('Updated token in db, returning', { name });
  return accessToken;
}
