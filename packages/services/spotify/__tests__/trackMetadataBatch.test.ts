import { fetchAllTrackMetadataBatch } from '../trackMetadataBatch';

const mockSpotifyGet = jest.fn<
  Promise<{ response: { json: () => Promise<unknown> }; status: number }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

/**
 * Builds a batch tracks response for GET /tracks?ids=
 */
const buildBatchTracksResponse = (
  tracks: Array<{ trackId: string; albumId: string; artistIds: Array<string> } | null>,
) => ({
  tracks: tracks.map((t) =>
    t
      ? {
          album: { id: t.albumId },
          artists: t.artistIds.map((id) => ({ id })),
          id: t.trackId,
          uri: `spotify:track:${t.trackId}`,
        }
      : null,
  ),
});

describe('fetchAllTrackMetadataBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches metadata for a single batch', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildBatchTracksResponse([
            { albumId: 'album-1', artistIds: ['artist-1'], trackId: 'track-1' },
            { albumId: 'album-2', artistIds: ['artist-2a', 'artist-2b'], trackId: 'track-2' },
          ]),
      },
      status: 200,
    });

    const result = await fetchAllTrackMetadataBatch(['track-1', 'track-2']);

    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks?ids=track-1,track-2');
    expect(result.metadata.size).toBe(2);
    expect(result.metadata.get('track-1')).toEqual({
      albumId: 'album-1',
      artistIds: ['artist-1'],
    });
    expect(result.metadata.get('track-2')).toEqual({
      albumId: 'album-2',
      artistIds: ['artist-2a', 'artist-2b'],
    });
    expect(result.batchErrors).toHaveLength(0);
  });

  it('handles null tracks in response (deleted/unavailable tracks)', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildBatchTracksResponse([
            { albumId: 'album-1', artistIds: ['artist-1'], trackId: 'track-1' },
            null, // Track deleted or unavailable
            { albumId: 'album-3', artistIds: ['artist-3'], trackId: 'track-3' },
          ]),
      },
      status: 200,
    });

    const result = await fetchAllTrackMetadataBatch(['track-1', 'track-missing', 'track-3']);

    expect(result.metadata.size).toBe(2);
    expect(result.metadata.has('track-1')).toBe(true);
    expect(result.metadata.has('track-3')).toBe(true);
    expect(result.batchErrors).toHaveLength(1);
    expect(result.batchErrors[0]).toEqual({
      error: 'Missing from API response',
      trackIds: ['track-missing'],
    });
  });

  it('chunks requests into batches of 50', async () => {
    const trackIds = Array.from({ length: 75 }, (_, i) => `track-${i}`);

    mockSpotifyGet.mockImplementation((resource: string) => {
      const ids = resource.replace('tracks?ids=', '').split(',');
      return Promise.resolve({
        response: {
          json: async () =>
            buildBatchTracksResponse(
              ids.map((id) => ({
                albumId: `album-${id}`,
                artistIds: [`artist-${id}`],
                trackId: id,
              })),
            ),
        },
        status: 200,
      });
    });

    const result = await fetchAllTrackMetadataBatch(trackIds);

    // Should make 2 calls: 50 + 25
    expect(mockSpotifyGet).toHaveBeenCalledTimes(2);
    expect(result.metadata.size).toBe(75);
  });

  it('retries on 429 rate limit', async () => {
    let callCount = 0;
    mockSpotifyGet.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ response: { json: async () => ({}) }, status: 429 });
      }
      return Promise.resolve({
        response: {
          json: async () =>
            buildBatchTracksResponse([
              { albumId: 'album-retry', artistIds: ['artist-retry'], trackId: 'track-retry' },
            ]),
        },
        status: 200,
      });
    });

    const result = await fetchAllTrackMetadataBatch(['track-retry']);

    expect(callCount).toBe(2);
    expect(result.metadata.size).toBe(1);
    expect(result.batchErrors).toHaveLength(0);
  }, 15000);

  it('returns empty result for non-200 response', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 500,
    });

    const result = await fetchAllTrackMetadataBatch(['track-fail']);

    expect(result.metadata.size).toBe(0);
    expect(result.batchErrors).toHaveLength(1);
  });

  it('handles empty input', async () => {
    const result = await fetchAllTrackMetadataBatch([]);

    expect(mockSpotifyGet).not.toHaveBeenCalled();
    expect(result.metadata.size).toBe(0);
    expect(result.batchErrors).toHaveLength(0);
  });

  it('handles re-linked tracks by preferring URI track ID', async () => {
    // Spotify may re-link tracks. Response id differs from uri id.
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          tracks: [
            {
              album: { id: 'album-relinked' },
              artists: [{ id: 'artist-relinked' }],
              id: 'new-track-id', // Different from requested
              uri: 'spotify:track:original-track-id', // Original ID in URI
            },
          ],
        }),
      },
      status: 200,
    });

    const result = await fetchAllTrackMetadataBatch(['original-track-id']);

    expect(result.metadata.size).toBe(1);
    expect(result.metadata.has('original-track-id')).toBe(true);
    expect(result.metadata.get('original-track-id')).toEqual({
      albumId: 'album-relinked',
      artistIds: ['artist-relinked'],
    });
  });
});
