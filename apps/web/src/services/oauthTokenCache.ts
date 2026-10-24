import 'server-only';

import {
  readStoredTokenFromDb,
  registerTokenCacheHooks,
  type StoredTokenRecord,
} from '@dg/services/clients/refreshedAccessToken';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';

type SerializedTokenRecord = {
  accessToken: string | null;
  expiryAt: string | null;
  refreshToken: string;
};

async function readRemoteCachedTokenRecord(name: string): Promise<SerializedTokenRecord> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.oauthToken);
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

export function registerOauthTokenCache(): void {
  registerTokenCacheHooks({
    onTokenUpdated: () => {
      try {
        revalidateTag(CACHE_TAGS.oauthToken, 'max');
      } catch {}
    },
    readToken: getCachedTokenRecord,
  });
}
