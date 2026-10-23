import 'server-only';
import type { CreateTokenProps, FetchTokenProps } from '@dg/db/models/Token';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import type { RefreshTokenConfig, ValidatedToken } from './RefreshTokenConfig';

type StoredTokenLookup = {
  accessToken: string | null;
  refreshToken: string;
};

const cachedTokens = new Map<string, ValidatedToken>();
const pendingLookups = new Map<string, Promise<StoredTokenLookup>>();
const pendingRefreshes = new Map<string, Promise<ValidatedToken>>();

export function clearTokenCache(): void {
  cachedTokens.clear();
}

export async function upsertAndCacheToken({
  name,
  accessToken,
  expiryAt,
  refreshToken,
}: CreateTokenProps) {
  const { db } = await import('@dg/db');
  const [token] = await db.Token.upsert({
    accessToken,
    expiryAt,
    name,
    refreshToken,
  });
  if (accessToken && expiryAt && refreshToken && Number(expiryAt) > Date.now()) {
    cachedTokens.set(name, { accessToken, expiryAt, refreshToken });
  } else {
    cachedTokens.delete(name);
  }
  return token;
}

async function queryLatestTokenFromDb({ name }: FetchTokenProps): Promise<StoredTokenLookup> {
  const { db } = await import('@dg/db');
  const token = await db.Token.findOne({
    attributes: ['accessToken', 'refreshToken', 'expiryAt'],
    where: { name },
  });

  if (!token?.refreshToken) {
    log.error('Missing token', { name });
    throw new MissingTokenError(name);
  }

  const { refreshToken, accessToken, expiryAt } = token;
  const isValid = Boolean(expiryAt && Number(expiryAt) > Date.now());
  if (isValid && accessToken && expiryAt) {
    cachedTokens.set(name, { accessToken, expiryAt, refreshToken });
  } else {
    cachedTokens.delete(name);
  }
  return { accessToken: isValid && accessToken ? accessToken : null, refreshToken };
}

function getLatestTokenIfValid({ name }: FetchTokenProps): Promise<StoredTokenLookup> {
  const existingLookup = pendingLookups.get(name);
  if (existingLookup) {
    return existingLookup;
  }
  const lookupPromise = queryLatestTokenFromDb({ name }).finally(() => {
    pendingLookups.delete(name);
  });
  pendingLookups.set(name, lookupPromise);
  return lookupPromise;
}

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
    cache: 'no-store',
    headers,
    method: 'POST',
  });
  const data: unknown = await rawData.json();
  if (!rawData.ok) {
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

async function refreshTokenAndPersistInternal(
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
  await upsertAndCacheToken({
    accessToken,
    expiryAt,
    name,
    refreshToken: newRefreshToken,
  });
  log.info('Updated token in db, returning', { name });
  return { accessToken, expiryAt, refreshToken: newRefreshToken };
}

async function refreshTokenAndPersist(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
): Promise<ValidatedToken> {
  const existingRefresh = pendingRefreshes.get(name);
  if (existingRefresh) {
    log.info('Token refresh already in progress, waiting for existing refresh', { name });
    return existingRefresh;
  }

  const refreshPromise = refreshTokenAndPersistInternal(name, refreshTokenConfig, refreshToken);
  pendingRefreshes.set(name, refreshPromise);

  try {
    return await refreshPromise;
  } finally {
    pendingRefreshes.delete(name);
  }
}

export async function forceRefreshTokenData(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
): Promise<ValidatedToken> {
  cachedTokens.delete(name);
  const currentData = await getLatestTokenIfValid({ name });
  return await refreshTokenAndPersist(name, refreshTokenConfig, currentData.refreshToken);
}

export async function refreshedAccessToken(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  forceRefresh?: boolean,
) {
  if (forceRefresh) {
    cachedTokens.delete(name);
  } else {
    const cached = cachedTokens.get(name);
    if (cached && Number(cached.expiryAt) > Date.now()) {
      return cached.accessToken;
    }
  }

  const currentData = await getLatestTokenIfValid({ name });
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
