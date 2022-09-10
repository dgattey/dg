import type { Prisma } from '@dg/api/server/generated';
import dbClient from '@dg/api/server/networkClients/dbClient';
import type { TokenKey } from '@dg/api/types/Token';
import fetchRefreshedTokenFromApi from './fetchRefreshedTokenFromApi';

/**
 * Creates or updates a possibly-existing token given a unique name and
 * access token/refresh token/expiry period.
 */
const createOrUpdateToken = async ({
  name,
  accessToken,
  expiryAt,
  refreshToken,
}: Omit<Prisma.TokenCreateArgs['data'], 'id'>) =>
  dbClient.token.upsert({
    create: {
      name,
      accessToken,
      expiryAt,
      refreshToken,
    },
    update: {
      accessToken,
      expiryAt,
      refreshToken,
    },
    where: {
      name,
    },
  });

/**
 * Gets a token if still valid/not expired. Throws an error if the token is
 * missing. Returns just the refresh token if invalid. Returns both the refresh
 * and access tokens if valid.
 */
const getLatestTokenIfValid = async ({ name }: Pick<Prisma.TokenCreateArgs['data'], 'name'>) => {
  const token = await dbClient.token.findUnique({
    where: { name },
    select: {
      accessToken: true,
      refreshToken: true,
      expiryAt: true,
    },
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
const refreshedAccessToken = async (name: TokenKey, forceRefresh?: boolean) => {
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

export default refreshedAccessToken;
