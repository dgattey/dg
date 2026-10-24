import * as v from 'valibot';
import { bestSpotifyImage, sleep, spotifyGet } from '../trackMetadataShared';

const mockSpotifyGet = jest.fn<
  Promise<{
    response: { json: () => Promise<unknown> };
    retryAfterSeconds?: number;
    status: number;
  }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

describe('bestSpotifyImage', () => {
  it('prefers the 640px image and falls back to the first image or empty string', () => {
    expect(
      bestSpotifyImage([
        { height: 300, url: 'https://image.test/300.jpg', width: 300 },
        { height: 640, url: 'https://image.test/640.jpg', width: 640 },
      ]),
    ).toBe('https://image.test/640.jpg');
    expect(bestSpotifyImage([{ height: 300, url: 'https://image.test/300.jpg', width: 300 }])).toBe(
      'https://image.test/300.jpg',
    );
    expect(bestSpotifyImage([])).toBe('');
  });
});

describe('sleep', () => {
  it('resolves after the specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;

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

describe('spotifyGet', () => {
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

    const result = await spotifyGet('test-resource', testSchema, 'test');

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

    const result = await spotifyGet('test-resource', testSchema, 'test');

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

    const result = await spotifyGet('test-resource', testSchema, 'test');

    expect(result).toEqual({
      error: 'HTTP 404',
      status: 404,
      success: false,
    });
  });

  it('gives up immediately on a rate limit instead of making the caller wait', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      retryAfterSeconds: 30,
      status: 429,
    });

    const started = Date.now();
    const result = await spotifyGet('test-resource', testSchema, 'test');

    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(result).toEqual({
      error: 'HTTP 429',
      retryAfterSeconds: 30,
      status: 429,
      success: false,
    });
  });
});
