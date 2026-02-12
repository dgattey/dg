import { fetchMultipleTrackMetadata, fetchSingleTrackMetadata } from '../trackMetadataSingle';

const mockSpotifyGet = jest.fn<
  Promise<{ response: { json: () => Promise<unknown> }; status: number }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

/**
 * Builds a single track response for GET /tracks/{id}
 */
const buildSingleTrackResponse = (track: {
  trackId: string;
  albumId: string;
  artistIds: Array<string>;
}) => ({
  album: { id: track.albumId },
  artists: track.artistIds.map((id) => ({ id })),
  id: track.trackId,
});

describe('fetchSingleTrackMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully fetches metadata for a single track', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildSingleTrackResponse({
            albumId: 'album-123',
            artistIds: ['artist-1', 'artist-2'],
            trackId: 'track-123',
          }),
      },
      status: 200,
    });

    const result = await fetchSingleTrackMetadata('track-123');

    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks/track-123');
    expect(result).toEqual({
      metadata: {
        albumId: 'album-123',
        artistIds: ['artist-1', 'artist-2'],
      },
      success: true,
    });
  });

  it('returns error for 404 not found', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 404,
    });

    const result = await fetchSingleTrackMetadata('nonexistent-track');

    expect(result).toEqual({
      error: 'Track not found',
      success: false,
    });
  });

  it('returns error for non-200/404 status', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 500,
    });

    const result = await fetchSingleTrackMetadata('track-123');

    expect(result).toEqual({
      error: 'HTTP 500',
      success: false,
    });
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
            buildSingleTrackResponse({
              albumId: 'album-retry',
              artistIds: ['artist-retry'],
              trackId: 'track-retry',
            }),
        },
        status: 200,
      });
    });

    const result = await fetchSingleTrackMetadata('track-retry');

    expect(callCount).toBe(2);
    expect(result).toEqual({
      metadata: {
        albumId: 'album-retry',
        artistIds: ['artist-retry'],
      },
      success: true,
    });
  }, 15000);

  it('fails after max retries on persistent 429', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 429,
    });

    const result = await fetchSingleTrackMetadata('track-persistent-429');

    // 4 calls: initial + 3 retries
    expect(mockSpotifyGet).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      error: 'Max retries exceeded',
      success: false,
    });
  }, 60000);
});

describe('fetchMultipleTrackMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches metadata for multiple tracks sequentially', async () => {
    mockSpotifyGet.mockImplementation((resource: string) => {
      const trackId = resource.replace('tracks/', '');
      return Promise.resolve({
        response: {
          json: async () =>
            buildSingleTrackResponse({
              albumId: `album-${trackId}`,
              artistIds: [`artist-${trackId}`],
              trackId,
            }),
        },
        status: 200,
      });
    });

    const result = await fetchMultipleTrackMetadata(['track-1', 'track-2', 'track-3']);

    expect(mockSpotifyGet).toHaveBeenCalledTimes(3);
    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks/track-1');
    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks/track-2');
    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks/track-3');

    expect(result.metadata.size).toBe(3);
    expect(result.metadata.get('track-1')).toEqual({
      albumId: 'album-track-1',
      artistIds: ['artist-track-1'],
    });
    expect(result.errors).toHaveLength(0);
  });

  it('collects errors for failed tracks while continuing', async () => {
    mockSpotifyGet.mockImplementation((resource: string) => {
      const trackId = resource.replace('tracks/', '');
      if (trackId === 'bad-track') {
        return Promise.resolve({ response: { json: async () => ({}) }, status: 404 });
      }
      return Promise.resolve({
        response: {
          json: async () =>
            buildSingleTrackResponse({
              albumId: `album-${trackId}`,
              artistIds: [`artist-${trackId}`],
              trackId,
            }),
        },
        status: 200,
      });
    });

    const result = await fetchMultipleTrackMetadata(['good-track-1', 'bad-track', 'good-track-2']);

    expect(result.metadata.size).toBe(2);
    expect(result.metadata.has('good-track-1')).toBe(true);
    expect(result.metadata.has('good-track-2')).toBe(true);
    expect(result.errors).toEqual([{ error: 'Track not found', trackId: 'bad-track' }]);
  });

  it('handles empty input', async () => {
    const result = await fetchMultipleTrackMetadata([]);

    expect(mockSpotifyGet).not.toHaveBeenCalled();
    expect(result.metadata.size).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('handles exceptions from API calls', async () => {
    mockSpotifyGet.mockRejectedValue(new Error('Network error'));

    const result = await fetchMultipleTrackMetadata(['track-error']);

    expect(result.metadata.size).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.trackId).toBe('track-error');
    expect(result.errors[0]?.error).toContain('Network error');
  });
});
