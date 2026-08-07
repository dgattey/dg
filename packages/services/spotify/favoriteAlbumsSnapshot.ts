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
 * Last stored favorites list, newest playlist addition first, or null when no
 * refresh has ever completed. An empty array means Spotify was reached and the
 * playlist was genuinely empty.
 *
 * Never throws: a missing table (a preview deployment reading a database that
 * hasn't migrated) has to degrade rather than take the page down.
 */
export async function readFavoriteAlbumsSnapshot(): Promise<Array<PlaylistAlbum> | null> {
  try {
    const rows = (await db.FavoriteAlbum.findAll({
      attributes: [...SNAPSHOT_FIELDS],
      order: [['addedAt', 'DESC']],
      raw: true,
    })) as unknown as Array<PlaylistAlbum>;
    if (rows.length > 0) {
      return rows;
    }

    // Preview builds skip migrations. Only the marker needs the new table, and
    // only an empty snapshot needs the marker, so populated snapshots remain
    // readable in previews immediately after the FavoriteAlbum migration.
    const snapshot = await db.FavoriteAlbumSnapshot.findOne({ where: { singleton: true } });
    return snapshot ? [] : null;
  } catch (error) {
    log.warn('Could not read stored favorite albums', { error });
    return null;
  }
}

/**
 * Replaces the stored favorites list with a fresh one. The playlist is the
 * source of truth, so removals have to disappear here too — hence replace
 * rather than upsert. Never throws; failing to store is not worth failing a
 * request that already has its data. The marker row records a successful empty
 * playlist too, so the UI can tell empty from temporarily unavailable.
 */
export async function writeFavoriteAlbumsSnapshot(albums: Array<PlaylistAlbum>): Promise<void> {
  try {
    await dbClient.transaction(async (transaction) => {
      await db.FavoriteAlbum.destroy({ transaction, where: {} });
      if (albums.length > 0) {
        await db.FavoriteAlbum.bulkCreate([...albums], { transaction });
      }
      await db.FavoriteAlbumSnapshot.upsert(
        { refreshedAt: new Date(), singleton: true },
        { transaction },
      );
    });
  } catch (error) {
    log.warn('Could not store favorite albums', { error });
  }
}
