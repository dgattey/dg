import 'server-only';
import type { CreateTokenProps, FetchTokenProps } from '@dg/db/models/Token';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import type { RefreshTokenConfig, ValidatedToken } from './RefreshTokenConfig';

export type StoredTokenRecord = {
  accessToken: string | null;
  expiryAt: Date | null;
  refreshToken: string;
};

type StoredTokenLookup = {
  accessToken: string | null;
  refreshToken: string;
};

type TokenCacheHooks = {
  onTokenUpdated?: (name: string) => void;
  readToken?: (name: string) => Promise<StoredTokenRecord>;
};

const cachedTokens = new Map<string, ValidatedToken>();
const pendingLookups = new Map<string, Promise<StoredTokenLookup>>();
const pendingRefreshes = new Map<string, Promise<ValidatedToken>>();
let tokenCacheHooks: TokenCacheHooks = {};

export function registerTokenCacheHooks(hooks: TokenCacheHooks): void {
  tokenCacheHooks = hooks;
}

export function clearTokenCache(): void {
  cachedTokens.clear();
}

export async function readStoredTokenFromDb(name: string): Promise<StoredTokenRecord> {
  const { db } = await import('@dg/db');
  const token = await db.Token.findOne({
    attributes: ['accessToken', 'refreshToken', 'expiryAt'],
    where: { name },
  });

  if (!token?.refreshToken) {
    log.error('Missing token', { name });
    throw new MissingTokenError(name);
  }

  return {
    accessToken: token.accessToken ?? null,
    expiryAt: token.expiryAt ?? null,
    refreshToken: token.refreshToken,
  };
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
  tokenCacheHooks.onTokenUpdated?.(name);
  return token;
}

async function readTokenWithHooks(name: string): Promise<StoredTokenRecord> {
  if (process.env.NODE_ENV !== 'test' && tokenCacheHooks.readToken) {
    try {
      return await tokenCacheHooks.readToken(name);
    } catch (error) {
      if (error instanceof MissingTokenError) {
        throw error;
      }
    }
  }
  return await readStoredTokenFromDb(name);
}

async function queryLatestTokenFromDb({ name }: FetchTokenProps): Promise<StoredTokenLookup> {
  const { refreshToken, accessToken, expiryAt } = await readTokenWithHooks(name);
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
  forcePersist: boolean,
): Promise<ValidatedToken> {
  log.info('Fetching refreshed token', { name });
  const {
    refreshToken: newRefreshToken,
    accessToken,
    expiryAt,
  } = await fetchRefreshedTokenFromApi(name, refreshTokenConfig, refreshToken);
  log.info('Fetched refreshed token', { name });
  if (forcePersist || newRefreshToken !== refreshToken) {
    await upsertAndCacheToken({
      accessToken,
      expiryAt,
      name,
      refreshToken: newRefreshToken,
    });
    log.info('Updated token in db, returning', { name });
  } else if (Number(expiryAt) > Date.now()) {
    cachedTokens.set(name, { accessToken, expiryAt, refreshToken: newRefreshToken });
  } else {
    cachedTokens.delete(name);
  }
  return { accessToken, expiryAt, refreshToken: newRefreshToken };
}

async function refreshTokenAndPersist(
  name: string,
  refreshTokenConfig: RefreshTokenConfig,
  refreshToken: string,
  forcePersist = false,
): Promise<ValidatedToken> {
  const existingRefresh = pendingRefreshes.get(name);
  if (existingRefresh) {
    log.info('Token refresh already in progress, waiting for existing refresh', { name });
    return existingRefresh;
  }

  const refreshPromise = refreshTokenAndPersistInternal(
    name,
    refreshTokenConfig,
    refreshToken,
    forcePersist,
  );
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
  return await refreshTokenAndPersist(name, refreshTokenConfig, currentData.refreshToken, true);
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
    false,
  );
  return accessToken;
}
