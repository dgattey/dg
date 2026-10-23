import 'server-only';

import {
  readStoredTokenFromDb,
  registerTokenCacheHooks,
  type StoredTokenRecord,
} from '@dg/services/clients/refreshedAccessToken';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';

const OAUTH_TOKEN_TAG = 'oauth-token';
const oauthProviderTokenTag = (name: string) => `oauth-token-${name}`;

type SerializedTokenRecord = {
  accessToken: string | null;
  expiryAt: string | null;
  refreshToken: string;
};

async function readRemoteCachedTokenRecord(name: string): Promise<SerializedTokenRecord> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(OAUTH_TOKEN_TAG);
  cacheTag(oauthProviderTokenTag(name));
  const record = await readStoredTokenFromDb(name);
  return {
    accessToken: record.accessToken,
    expiryAt: record.expiryAt ? record.expiryAt.toISOString() : null,
    refreshToken: record.refreshToken,
  };
}

export async function getCachedTokenRecord(name: string): Promise<StoredTokenRecord> {
  const cached = await readRemoteCachedTokenRecord(name);
  return {
    accessToken: cached.accessToken,
    expiryAt: cached.expiryAt ? new Date(cached.expiryAt) : null,
    refreshToken: cached.refreshToken,
  };
}

registerTokenCacheHooks({
  onTokenUpdated: (name) => {
    try {
      revalidateTag(OAUTH_TOKEN_TAG, 'max');
      revalidateTag(oauthProviderTokenTag(name), 'max');
    } catch {}
  },
  readToken: getCachedTokenRecord,
});
