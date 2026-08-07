const mockFetchPlaylistAlbums = jest.fn();
const mockWriteSnapshot = jest.fn();

jest.mock('../fetchPlaylistAlbums', () => ({
  fetchPlaylistAlbums: () => mockFetchPlaylistAlbums(),
}));

jest.mock('../favoriteAlbumsSnapshot', () => ({
  writeFavoriteAlbumsSnapshot: (albums: unknown) => mockWriteSnapshot(albums),
}));

import {
  refreshFavoriteAlbumsSnapshot,
  refreshFavoriteAlbumsSnapshotWithLogging,
} from '../refreshFavoriteAlbumsSnapshot';

describe('refreshFavoriteAlbumsSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores a successful playlist read, including an intentionally empty one', async () => {
    mockFetchPlaylistAlbums.mockResolvedValue([]);
    mockWriteSnapshot.mockResolvedValue(undefined);

    await expect(refreshFavoriteAlbumsSnapshot()).resolves.toEqual({ count: 0 });
    expect(mockWriteSnapshot).toHaveBeenCalledWith([]);
  });

  it('keeps the existing snapshot and returns without retrying when Spotify fails', async () => {
    mockFetchPlaylistAlbums.mockRejectedValue(new Error('status 429'));

    await expect(refreshFavoriteAlbumsSnapshotWithLogging()).resolves.toBeNull();
    expect(mockFetchPlaylistAlbums).toHaveBeenCalledTimes(1);
    expect(mockWriteSnapshot).not.toHaveBeenCalled();
  });
});
