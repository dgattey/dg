import 'server-only';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { db, dbClient } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';

const SNAPSHOT_FIELDS = [
  'addedAt',
  'artistNames',
  'id',
  'imageUrl',
  'name',
  'primaryArtist',
  'releaseDate',
  'url',
] as const;

/**
 * Last stored favorites list, newest playlist addition first, or null when
 * nothing has been stored yet. Never throws: a missing table (a preview
 * deployment reading a database that hasn't migrated) has to degrade rather
 * than take the page down.
 */
export async function readFavoriteAlbumsSnapshot(): Promise<Array<PlaylistAlbum> | null> {
  try {
    const rows = await db.FavoriteAlbum.findAll({
      attributes: [...SNAPSHOT_FIELDS],
      order: [['addedAt', 'DESC']],
      raw: true,
    });
    return rows.length > 0 ? (rows as unknown as Array<PlaylistAlbum>) : null;
  } catch (error) {
    log.warn('Could not read stored favorite albums', { error });
    return null;
  }
}

/**
 * Replaces the stored favorites list with a fresh one. The playlist is the
 * source of truth, so removals have to disappear here too — hence replace
 * rather than upsert. Never throws; failing to store is not worth failing a
 * request that already has its data.
 */
export async function writeFavoriteAlbumsSnapshot(albums: Array<PlaylistAlbum>): Promise<void> {
  if (albums.length === 0) {
    return;
  }
  try {
    await dbClient.transaction(async (transaction) => {
      await db.FavoriteAlbum.destroy({ transaction, where: {} });
      await db.FavoriteAlbum.bulkCreate([...albums], { transaction });
    });
  } catch (error) {
    log.warn('Could not store favorite albums', { error });
  }
}
