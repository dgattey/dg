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

  it('reads populated rows without requiring the newer marker table state', async () => {
    await db.FavoriteAlbum.create(album);

    await expect(readFavoriteAlbumsSnapshot()).resolves.toEqual([album]);
  });
});
