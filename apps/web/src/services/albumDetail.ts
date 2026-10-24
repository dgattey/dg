import 'server-only';

import { fetchAlbumDetail } from '@dg/services/spotify/fetchAlbumDetail';
import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import { cacheLife } from 'next/cache';
import './oauthTokenCache';

async function getAlbumDetailCached(albumId: string) {
  'use cache';
  cacheLife('weeks');
  return await fetchAlbumDetail(albumId);
}

export async function getAlbumDetail(albumId: string) {
  try {
    return await getAlbumDetailCached(albumId);
  } catch (error) {
    if (isMissingTokenError(error)) {
      return undefined;
    }
    log.warn('Album detail unavailable; degrading to empty state', { albumId, error });
    return undefined;
  }
}
