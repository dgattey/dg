import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import * as v from 'valibot';
import {
  extractMetadataFromTrack,
  extractTrackId,
  getExistingTrackMetadata,
  sleep,
  spotifyGetWithRetry,
  trackSchema,
} from '../trackMetadataShared';

const mockSpotifyGet = jest.fn<
  Promise<{ response: { json: () => Promise<unknown> }; status: number }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

// Use unique prefix for this test file to avoid conflicts with parallel tests
const PREFIX = 'shared';

describe('extractTrackId', () => {
  it('extracts track ID from a standard Spotify URI', () => {
    expect(extractTrackId('spotify:track:abc123')).toBe('abc123');
  });

  it('handles URIs with special characters in ID', () => {
    expect(extractTrackId('spotify:track:7ouMYWpwJ422jRcDASAM9z')).toBe('7ouMYWpwJ422jRcDASAM9z');
  });

  it('returns empty string for malformed URI without track ID', () => {
    expect(extractTrackId('spotify:track:')).toBe('');
    expect(extractTrackId('spotify:track')).toBe('');
    expect(extractTrackId('')).toBe('');
  });

  it('handles URIs with extra colons in ID', () => {
    // Edge case: if ID somehow had colons, we only take index 2
    expect(extractTrackId('spotify:track:id:with:colons')).toBe('id');
  });
});

describe('getExistingTrackMetadata', () => {
  const db = setupTestDatabase();

  beforeEach(async () => {
    await db.SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  afterEach(async () => {
    await db.SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  it('returns empty map for empty input', async () => {
    const result = await getExistingTrackMetadata([]);
    expect(result.size).toBe(0);
  });

  it('returns empty map when no tracks exist in DB', async () => {
    const result = await getExistingTrackMetadata([`${PREFIX}-nonexistent`]);
    expect(result.size).toBe(0);
  });

  it('returns metadata for tracks that exist in DB', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-1`,
      artistIds: [`${PREFIX}-artist-1a`, `${PREFIX}-artist-1b`],
      playedAt: new Date(),
      trackId: `${PREFIX}-track-1`,
    });

    const result = await getExistingTrackMetadata([`${PREFIX}-track-1`]);

    expect(result.size).toBe(1);
    expect(result.get(`${PREFIX}-track-1`)).toEqual({
      albumId: `${PREFIX}-album-1`,
      artistIds: [`${PREFIX}-artist-1a`, `${PREFIX}-artist-1b`],
    });
  });

  it('returns metadata for multiple tracks', async () => {
    await db.SpotifyPlay.bulkCreate([
      {
        albumId: `${PREFIX}-album-a`,
        artistIds: [`${PREFIX}-artist-a`],
        playedAt: new Date(),
        trackId: `${PREFIX}-track-a`,
      },
      {
        albumId: `${PREFIX}-album-b`,
        artistIds: [`${PREFIX}-artist-b`],
        playedAt: new Date(),
        trackId: `${PREFIX}-track-b`,
      },
    ]);

    const result = await getExistingTrackMetadata([
      `${PREFIX}-track-a`,
      `${PREFIX}-track-b`,
      `${PREFIX}-track-missing`,
    ]);

    expect(result.size).toBe(2);
    expect(result.has(`${PREFIX}-track-a`)).toBe(true);
    expect(result.has(`${PREFIX}-track-b`)).toBe(true);
    expect(result.has(`${PREFIX}-track-missing`)).toBe(false);
  });

  it('returns deduplicated metadata when track has multiple plays', async () => {
    // Same track played multiple times
    await db.SpotifyPlay.bulkCreate([
      {
        albumId: `${PREFIX}-album-dup`,
        artistIds: [`${PREFIX}-artist-dup`],
        playedAt: new Date('2025-01-01'),
        trackId: `${PREFIX}-track-dup`,
      },
      {
        albumId: `${PREFIX}-album-dup`,
        artistIds: [`${PREFIX}-artist-dup`],
        playedAt: new Date('2025-01-02'),
        trackId: `${PREFIX}-track-dup`,
      },
    ]);

    const result = await getExistingTrackMetadata([`${PREFIX}-track-dup`]);

    // Should return one entry, not two
    expect(result.size).toBe(1);
    expect(result.get(`${PREFIX}-track-dup`)).toEqual({
      albumId: `${PREFIX}-album-dup`,
      artistIds: [`${PREFIX}-artist-dup`],
    });
  });
});

describe('sleep', () => {
  it('resolves after the specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;

    // Allow some tolerance for timing
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(elapsed).toBeLessThan(150);
  });

  it('can be called with 0ms', async () => {
    const start = Date.now();
    await sleep(0);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(50);
  });
});

describe('extractMetadataFromTrack', () => {
  it('extracts metadata from a track response', () => {
    const track = {
      album: { id: 'album-123' },
      artists: [{ id: 'artist-1' }, { id: 'artist-2' }],
      id: 'track-123',
    };

    const result = extractMetadataFromTrack(track);

    expect(result).toEqual({
      albumId: 'album-123',
      artistIds: ['artist-1', 'artist-2'],
    });
  });

  it('handles single artist', () => {
    const track = {
      album: { id: 'album-solo' },
      artists: [{ id: 'solo-artist' }],
      id: 'track-solo',
    };

    const result = extractMetadataFromTrack(track);

    expect(result).toEqual({
      albumId: 'album-solo',
      artistIds: ['solo-artist'],
    });
  });

  it('handles track with uri field', () => {
    const track = {
      album: { id: 'album-uri' },
      artists: [{ id: 'artist-uri' }],
      id: 'track-uri',
      uri: 'spotify:track:track-uri',
    };

    const result = extractMetadataFromTrack(track);

    expect(result).toEqual({
      albumId: 'album-uri',
      artistIds: ['artist-uri'],
    });
  });
});

describe('spotifyGetWithRetry', () => {
  const testSchema = v.looseObject({
    data: v.string(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on successful 200 response', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ data: 'test-value' }) },
      status: 200,
    });

    const result = await spotifyGetWithRetry('test-resource', testSchema, 'test');

    expect(result).toEqual({
      data: { data: 'test-value' },
      status: 200,
      success: true,
    });
    expect(mockSpotifyGet).toHaveBeenCalledWith('test-resource');
  });

  it('returns error on non-200 status', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 500,
    });

    const result = await spotifyGetWithRetry('test-resource', testSchema, 'test');

    expect(result).toEqual({
      error: 'HTTP 500',
      status: 500,
      success: false,
    });
  });

  it('returns error on 404 status', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 404,
    });

    const result = await spotifyGetWithRetry('test-resource', testSchema, 'test');

    expect(result).toEqual({
      error: 'HTTP 404',
      status: 404,
      success: false,
    });
  });

  it('retries on 429 rate limit then succeeds', async () => {
    let callCount = 0;
    mockSpotifyGet.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ response: { json: async () => ({}) }, status: 429 });
      }
      return Promise.resolve({
        response: { json: async () => ({ data: 'retry-success' }) },
        status: 200,
      });
    });

    const result = await spotifyGetWithRetry('test-resource', testSchema, 'test');

    expect(callCount).toBe(2);
    expect(result).toEqual({
      data: { data: 'retry-success' },
      status: 200,
      success: true,
    });
  }, 15000);

  it('fails after max retries on persistent 429', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 429,
    });

    const result = await spotifyGetWithRetry('test-resource', testSchema, 'test');

    // 4 calls: initial + 3 retries
    expect(mockSpotifyGet).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      error: 'Max retries exceeded',
      status: 429,
      success: false,
    });
  }, 60000);
});

describe('trackSchema', () => {
  it('parses a valid track response', () => {
    const track = {
      album: { id: 'album-123', images: [], name: 'Album Name' },
      artists: [{ id: 'artist-1', name: 'Artist' }],
      id: 'track-123',
      name: 'Track Name',
      popularity: 50,
      uri: 'spotify:track:track-123',
    };

    const result = v.parse(trackSchema, track);

    expect(result.album.id).toBe('album-123');
    expect(result.artists).toHaveLength(1);
    expect(result.id).toBe('track-123');
    expect(result.uri).toBe('spotify:track:track-123');
  });

  it('parses track without optional uri', () => {
    const track = {
      album: { id: 'album-no-uri' },
      artists: [{ id: 'artist-no-uri' }],
      id: 'track-no-uri',
    };

    const result = v.parse(trackSchema, track);

    expect(result.id).toBe('track-no-uri');
    expect(result.uri).toBeUndefined();
  });
});
