import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { readFavoriteAlbumsSnapshot, writeFavoriteAlbumsSnapshot } from '../favoriteAlbumsSnapshot';

const db = setupTestDatabase();

const album: PlaylistAlbum = {
  addedAt: '2024-01-01T00:00:00Z',
  artistNames: 'Artist',
  id: '1234567890123456789012',
  imageUrl: 'https://image.test/cover.jpg',
  name: 'Album',
  primaryArtist: 'Artist',
  releaseDate: '2024-01-01',
  url: 'https://open.spotify.com/album/1234567890123456789012',
};

describe('favorite albums snapshot', () => {
  beforeEach(async () => {
    await db.FavoriteAlbum.destroy({ where: {} });
    await db.FavoriteAlbumSnapshot.destroy({ where: {} });
  });

  it('distinguishes never refreshed, empty, and populated snapshots', async () => {
    await expect(readFavoriteAlbumsSnapshot()).resolves.toBeNull();

    await writeFavoriteAlbumsSnapshot([]);
    await expect(readFavoriteAlbumsSnapshot()).resolves.toEqual([]);

    await writeFavoriteAlbumsSnapshot([album]);
    await expect(readFavoriteAlbumsSnapshot()).resolves.toEqual([album]);
  });

  it('reports whether the stored list changed and skips identical album writes without querying the DB when storedSnapshot is provided', async () => {
    await expect(writeFavoriteAlbumsSnapshot([album])).resolves.toBe(true);

    const findAllSpy = jest.spyOn(db.FavoriteAlbum, 'findAll');
    try {
      await expect(writeFavoriteAlbumsSnapshot([{ ...album }], [album])).resolves.toBe(false);
      expect(findAllSpy).not.toHaveBeenCalled();
    } finally {
      findAllSpy.mockRestore();
    }

    await expect(writeFavoriteAlbumsSnapshot([{ ...album }])).resolves.toBe(false);
    await expect(writeFavoriteAlbumsSnapshot([{ ...album, name: 'Renamed' }])).resolves.toBe(true);
    await expect(writeFavoriteAlbumsSnapshot([])).resolves.toBe(true);
    await expect(writeFavoriteAlbumsSnapshot([])).resolves.toBe(false);
    await expect(readFavoriteAlbumsSnapshot()).resolves.toEqual([]);
  });

  it('reads populated rows without requiring the newer marker table state', async () => {
    await db.FavoriteAlbum.create(album);

    await expect(readFavoriteAlbumsSnapshot()).resolves.toEqual([album]);
  });
});
