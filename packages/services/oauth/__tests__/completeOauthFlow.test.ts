import { setupMockLifecycle } from '@dg/testing/mocks';
import { setupTestDatabase } from '../../testing/setupTestDatabase';

const getUrl = (input: RequestInfo): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

describe('completeOauthFlow', () => {
  const db = setupTestDatabase({ truncate: ['OauthState', 'Token'] });
  setupMockLifecycle();

  const originalEnv = process.env;
  const originalFetch = global.fetch;

  let completeOauthFlow: typeof import('../completeOauthFlow').completeOauthFlow;

  beforeAll(async () => {
    process.env = {
      ...originalEnv,
      OAUTH_CALLBACK_URL: 'https://example.com/api/oauth',
      SPOTIFY_CLIENT_ID: 'spotify-client-id',
      STRAVA_CLIENT_ID: 'strava-client-id',
      STRAVA_CLIENT_SECRET: 'strava-client-secret',
    };

    global.fetch = jest.fn() as unknown as typeof fetch;
    ({ completeOauthFlow } = await import('../completeOauthFlow'));
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('uses PKCE verifier for Spotify and persists token', async () => {
    const state = 'spotify-state';
    const code = 'spotify-code';

    await db.OauthState.create({
      codeVerifier: 'pkce-verifier',
      expiresAt: new Date(Date.now() + 60_000),
      provider: 'spotify',
      state,
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://accounts.spotify.com/api/token') {
        return Promise.resolve({
          json: async () => ({
            access_token: 'spotify-access',
            expires_in: 3600,
            refresh_token: 'spotify-refresh',
            token_type: 'Bearer',
          }),
          ok: true,
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const result = await completeOauthFlow({ code, state });
    expect(result).toEqual({ status: 'success' });

    const savedToken = await db.Token.findOne({ where: { name: 'spotify' } });
    expect(savedToken?.accessToken).toBe('spotify-access');
    expect(savedToken?.refreshToken).toBe('spotify-refresh');

    const storedState = await db.OauthState.findByPk(state);
    expect(storedState).toBeNull();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [RequestInfo, RequestInit];
    const body = init?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect((body as URLSearchParams).get('code_verifier')).toBe('pkce-verifier');
    expect((body as URLSearchParams).get('client_id')).toBe('spotify-client-id');
    expect(init?.headers).not.toHaveProperty('Authorization');
  });

  it('exchanges Strava code and persists token', async () => {
    const state = 'strava-state';
    const code = 'strava-code';

    await db.OauthState.create({
      codeVerifier: undefined,
      expiresAt: new Date(Date.now() + 60_000),
      provider: 'strava',
      state,
    });

    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo) => {
      const url = getUrl(input);
      if (url === 'https://www.strava.com/oauth/token') {
        return Promise.resolve({
          json: async () => ({
            access_token: 'strava-access',
            expires_at: 1_800_000_000,
            expires_in: 21_600,
            refresh_token: 'strava-refresh',
            token_type: 'Bearer',
          }),
          ok: true,
          status: 200,
        });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const result = await completeOauthFlow({ code, state });
    expect(result).toEqual({ status: 'success' });

    const savedToken = await db.Token.findOne({ where: { name: 'strava' } });
    expect(savedToken?.accessToken).toBe('strava-access');
    expect(savedToken?.refreshToken).toBe('strava-refresh');

    const storedState = await db.OauthState.findByPk(state);
    expect(storedState).toBeNull();
  });
});
