import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { setupMockLifecycle } from '@dg/testing/mocks';
import type { RefreshTokenConfig } from '../RefreshTokenConfig';
import { refreshedAccessToken } from '../refreshedAccessToken';

const getUrl = (input: RequestInfo): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

describe('refreshedAccessToken', () => {
  const db = setupTestDatabase();
  setupMockLifecycle();

  const originalFetch = global.fetch;

  const mockRefreshConfig: RefreshTokenConfig = {
    body: (refreshToken) => ({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    endpoint: 'https://example.com/oauth/token',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validate: (rawData, existingRefreshToken) => {
      const data = rawData as { access_token: string; expires_in: number; refresh_token?: string };
      return {
        accessToken: data.access_token,
        expiryAt: new Date(Date.now() + data.expires_in * 1000),
        refreshToken: data.refresh_token ?? existingRefreshToken,
      };
    },
  };

  beforeAll(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('returns existing valid access token without refreshing', async () => {
    await db.Token.upsert({
      accessToken: 'valid-access-token',
      expiryAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      name: 'test-token',
      refreshToken: 'test-refresh',
    });

    const result = await refreshedAccessToken('test-token', mockRefreshConfig);

    expect(result).toBe('valid-access-token');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('refreshes expired token and returns new access token', async () => {
    await db.Token.upsert({
      accessToken: 'expired-access-token',
      expiryAt: new Date(0), // Expired
      name: 'test-token',
      refreshToken: 'test-refresh',
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://example.com/oauth/token') {
        return Promise.resolve({
          json: async () => ({
            access_token: 'new-access-token',
            expires_in: 3600,
            refresh_token: 'new-refresh-token',
          }),
          ok: true,
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const result = await refreshedAccessToken('test-token', mockRefreshConfig);

    expect(result).toBe('new-access-token');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const updatedToken = await db.Token.findOne({ where: { name: 'test-token' } });
    expect(updatedToken?.accessToken).toBe('new-access-token');
    expect(updatedToken?.refreshToken).toBe('new-refresh-token');
  });

  it('deduplicates concurrent refresh requests - only one API call is made', async () => {
    await db.Token.upsert({
      accessToken: 'expired-access-token',
      expiryAt: new Date(0), // Expired
      name: 'concurrent-test',
      refreshToken: 'test-refresh',
    });

    // Create a delayed mock that we can control
    let resolveRefresh: ((value: unknown) => void) | undefined;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://example.com/oauth/token') {
        return refreshPromise.then(() => ({
          json: async () => ({
            access_token: 'concurrent-new-access',
            expires_in: 3600,
            refresh_token: 'concurrent-new-refresh',
          }),
          ok: true,
          status: 200,
        }));
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    // Start 3 concurrent refresh requests
    const request1 = refreshedAccessToken('concurrent-test', mockRefreshConfig);
    const request2 = refreshedAccessToken('concurrent-test', mockRefreshConfig);
    const request3 = refreshedAccessToken('concurrent-test', mockRefreshConfig);

    // Resolve the fetch after all requests have started
    resolveRefresh?.(undefined);

    // All requests should return the same result
    const [result1, result2, result3] = await Promise.all([request1, request2, request3]);

    expect(result1).toBe('concurrent-new-access');
    expect(result2).toBe('concurrent-new-access');
    expect(result3).toBe('concurrent-new-access');

    // Only ONE API call should have been made despite 3 concurrent requests
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('allows new refresh after previous one completes', async () => {
    await db.Token.upsert({
      accessToken: 'expired-access-token',
      expiryAt: new Date(0),
      name: 'sequential-test',
      refreshToken: 'test-refresh',
    });

    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://example.com/oauth/token') {
        callCount++;
        return Promise.resolve({
          json: async () => ({
            access_token: `access-${callCount}`,
            expires_in: 0, // Immediately expired so next call will also refresh
            refresh_token: `refresh-${callCount}`,
          }),
          ok: true,
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    // First refresh
    const result1 = await refreshedAccessToken('sequential-test', mockRefreshConfig);
    expect(result1).toBe('access-1');

    // Second refresh (should make another API call since first completed)
    const result2 = await refreshedAccessToken('sequential-test', mockRefreshConfig);
    expect(result2).toBe('access-2');

    // Two sequential refreshes = two API calls
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
