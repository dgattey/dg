'use server';

import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { getAlbumDetail } from './albums';

/**
 * Server action for loading cached album details inside the favorite-albums well.
 */
export async function loadAlbumDetail(albumId: string): Promise<AlbumDetail | null | undefined> {
  return await getAlbumDetail(albumId);
}
