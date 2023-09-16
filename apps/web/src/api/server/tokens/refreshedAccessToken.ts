import { db } from 'db/dbClient';
import { CreateTokenProps, FetchTokenProps } from 'db/models/Token';
import { fetchRefreshedTokenFromApi } from './fetchRefreshedTokenFromApi';

/**
 * Creates or updates a possibly-existing token given a unique name and
 * access token/refresh token/expiry period.
 */
const createOrUpdateToken = async ({
  name,
  accessToken,
  expiryAt,
  refreshToken,
}: CreateTokenProps) => {
  const token = await db.Token.upsert({ name, accessToken, expiryAt, refreshToken });
  return token[0];
};

/**
 * Gets a token if still valid/not expired. Throws an error if the token is
 * missing. Returns just the refresh token if invalid. Returns both the refresh
 * and access tokens if valid.
 */
const getLatestTokenIfValid = async ({ name }: FetchTokenProps) => {
  const token = await db.Token.findOne({
    where: { name },
    attributes: ['accessToken', 'refreshToken', 'expiryAt'],
  });

  // Shouldn't happen unless invalid name, so it's a big error
  if (!token || !token.refreshToken) {
    throw new TypeError('Missing token');
  }

  // Return either refresh + access, or just refresh if invalid
  const { refreshToken, accessToken, expiryAt } = token;
  const isValid = expiryAt && +expiryAt > Date.now();
  return { refreshToken, accessToken: isValid ? accessToken : null };
};

/**
 * Checks if our access token/key is still valid. If so, returns the access token.
 * Otherwise, grabs a new refresh/access token pair, updates the DB with the new
 * data, and returns the updated access token. May throw an error if something is
 * misconfigured. Should be caught higher up. If you force refresh, that means
 * it'll attempt to get a refreshed token even if the current token appears valid.
 * Should be used in case of 4xx codes from users.
 */
export const refreshedAccessToken = async (name: string, forceRefresh?: boolean) => {
  const currentData = await getLatestTokenIfValid({ name });
  if (currentData.accessToken && !forceRefresh) {
    return currentData.accessToken;
  }

  // Grab a new token and save it
  const { refreshToken, accessToken, expiryAt } = await fetchRefreshedTokenFromApi(
    name,
    currentData.refreshToken,
  );
  await createOrUpdateToken({ name, accessToken, refreshToken, expiryAt });
  return accessToken;
};
