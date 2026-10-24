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

    const snapshot = await db.FavoriteAlbumSnapshot.findOne({ where: { singleton: true } });
    return snapshot ? [] : null;
  } catch (error) {
    log.warn('Could not read stored favorite albums', { error });
    return null;
  }
}

const snapshotKey = (album: PlaylistAlbum) =>
  JSON.stringify(SNAPSHOT_FIELDS.map((field) => album[field]));

const isStoredSnapshot = (stored: Array<PlaylistAlbum> | null, albums: Array<PlaylistAlbum>) => {
  if (stored === null || stored.length !== albums.length) {
    return false;
  }
  const storedKeys = new Set(stored.map(snapshotKey));
  return albums.every((album) => storedKeys.has(snapshotKey(album)));
};

export async function writeFavoriteAlbumsSnapshot(
  albums: Array<PlaylistAlbum>,
  storedSnapshot?: Array<PlaylistAlbum> | null,
): Promise<boolean> {
  const existing =
    storedSnapshot !== undefined ? storedSnapshot : await readFavoriteAlbumsSnapshot();
  if (isStoredSnapshot(existing, albums)) {
    return false;
  }
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
    return true;
  } catch (error) {
    log.warn('Could not store favorite albums', { error });
    return false;
  }
}
