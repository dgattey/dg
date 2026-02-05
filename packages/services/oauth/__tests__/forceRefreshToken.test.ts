import { setupMockLifecycle } from '@dg/testing/mocks';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { forceRefreshToken } from '../forceRefreshToken';

const getUrl = (input: RequestInfo): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

describe('forceRefreshToken', () => {
  const db = setupTestDatabase();
  setupMockLifecycle();

  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      SPOTIFY_CLIENT_ID: 'spotify-client-id',
      STRAVA_CLIENT_ID: 'strava-client-id',
      STRAVA_CLIENT_SECRET: 'strava-client-secret',
    };
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('refreshes Spotify tokens and persists updates', async () => {
    await db.Token.upsert({
      accessToken: 'old-access',
      expiryAt: new Date(0),
      name: 'spotify',
      refreshToken: 'old-refresh',
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://accounts.spotify.com/api/token/') {
        return Promise.resolve({
          json: async () => ({
            access_token: 'new-access',
            expires_in: 3600,
            refresh_token: 'new-refresh',
            token_type: 'Bearer',
          }),
          ok: true,
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const result = await forceRefreshToken('spotify');
    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeInstanceOf(Date);

    const updatedToken = await db.Token.findOne({ where: { name: 'spotify' } });
    expect(updatedToken?.accessToken).toBe('new-access');
    expect(updatedToken?.refreshToken).toBe('new-refresh');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [RequestInfo, RequestInit];
    const body = init?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect((body as URLSearchParams).get('client_id')).toBe('spotify-client-id');
    expect(init?.headers).not.toHaveProperty('Authorization');
  });

  it('maps 401 refresh responses to re-auth errors', async () => {
    await db.Token.upsert({
      accessToken: 'old-access',
      expiryAt: new Date(0),
      name: 'strava',
      refreshToken: 'strava-refresh',
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://www.strava.com/api/v3/oauth/token') {
        return Promise.resolve({
          json: async () => ({ message: 'invalid_grant' }),
          ok: false,
          status: 401,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const result = await forceRefreshToken('strava');
    expect(result.success).toBe(false);
    expect(result.error).toBe('No refresh token found. Please re-authenticate.');
  });
});
