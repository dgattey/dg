import { oauthRoute } from '@dg/shared-core/routes/api';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { NextRequest } from 'next/server';
import { GET } from '../route';

jest.mock('@dg/services/oauth/exchangeStravaCodeForToken', () => ({
  exchangeStravaCodeForToken: jest.fn(),
}));

jest.mock('@dg/services/oauth/exchangeSpotifyCodeForToken', () => ({
  exchangeSpotifyCodeForToken: jest.fn(),
}));

// Mock the database state storage
const mockSaveOauthState = jest.fn();
const mockRetrieveAndDeleteOauthState = jest.fn();
const mockCleanupExpiredOauthStates = jest.fn();

jest.mock('@dg/services/oauth/oauthStateStorage', () => ({
  cleanupExpiredOauthStates: () => mockCleanupExpiredOauthStates(),
  retrieveAndDeleteOauthState: (state: string) => mockRetrieveAndDeleteOauthState(state),
  saveOauthState: (params: unknown) => mockSaveOauthState(params),
}));

import * as spotifyService from '@dg/services/oauth/exchangeSpotifyCodeForToken';
import * as stravaService from '@dg/services/oauth/exchangeStravaCodeForToken';

const mockExchangeStravaCode = jest.mocked(stravaService.exchangeStravaCodeForToken);
const mockExchangeSpotifyCode = jest.mocked(spotifyService.exchangeSpotifyCodeForToken);

const createGetRequest = (params: Record<string, string>) => {
  const url = new URL(`https://example.com${oauthRoute}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, { method: 'GET' });
};

describe('OAuth Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRetrieveAndDeleteOauthState.mockResolvedValue(null);
    mockSaveOauthState.mockResolvedValue(undefined);
    mockCleanupExpiredOauthStates.mockResolvedValue(0);
  });

  it('redirects to console when no params provided', async () => {
    const response = await GET(createGetRequest({}));

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe(`https://example.com${devConsoleRoute}`);
  });

  describe('Callback flow (code param)', () => {
    it('returns 400 when state is missing', async () => {
      const response = await GET(createGetRequest({ code: 'auth_code' }));

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Missing state parameter');
    });

    it('returns 400 when state is not found in database', async () => {
      mockRetrieveAndDeleteOauthState.mockResolvedValue(null);

      const response = await GET(createGetRequest({ code: 'auth_code', state: 'test-state' }));

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Invalid or expired OAuth state');
    });

    it('returns 400 for unknown provider in stored state', async () => {
      const state = 'test-state-123';
      mockRetrieveAndDeleteOauthState.mockResolvedValue({
        codeVerifier: 'test-code-verifier',
        provider: 'unknown',
      });

      const response = await GET(createGetRequest({ code: 'auth_code', state }));

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Unknown OAuth provider');
    });

    describe('Strava', () => {
      const state = 'strava-test-state-123';

      beforeEach(() => {
        mockRetrieveAndDeleteOauthState.mockResolvedValue({
          codeVerifier: 'test-code-verifier-12345',
          provider: 'strava',
        });
      });

      it('exchanges code for token and redirects to /console', async () => {
        mockExchangeStravaCode.mockResolvedValue('<html>Strava Success</html>');

        const response = await GET(createGetRequest({ code: 'strava_code', state }));

        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe(`https://example.com${devConsoleRoute}`);
        expect(mockExchangeStravaCode).toHaveBeenCalledWith('strava_code');
        expect(mockExchangeSpotifyCode).not.toHaveBeenCalled();
        expect(mockRetrieveAndDeleteOauthState).toHaveBeenCalledWith(state);
      });

      it('returns 500 when token exchange fails', async () => {
        mockExchangeStravaCode.mockRejectedValue(new Error('Exchange failed'));

        const response = await GET(createGetRequest({ code: 'strava_code', state }));

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error).toBe('Could not complete OAuth flow');
      });
    });

    describe('Spotify', () => {
      const state = 'spotify-test-state-456';

      beforeEach(() => {
        mockRetrieveAndDeleteOauthState.mockResolvedValue({
          codeVerifier: 'test-code-verifier-12345',
          provider: 'spotify',
        });
      });

      it('exchanges code for token and redirects to /console', async () => {
        mockExchangeSpotifyCode.mockResolvedValue('<html>Spotify Success</html>');

        const response = await GET(createGetRequest({ code: 'spotify_code', state }));

        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe(`https://example.com${devConsoleRoute}`);
        // Spotify gets the code verifier for PKCE
        expect(mockExchangeSpotifyCode).toHaveBeenCalledWith(
          'spotify_code',
          'test-code-verifier-12345',
        );
        expect(mockExchangeStravaCode).not.toHaveBeenCalled();
        expect(mockRetrieveAndDeleteOauthState).toHaveBeenCalledWith(state);
      });

      it('returns 500 when token exchange fails', async () => {
        mockExchangeSpotifyCode.mockRejectedValue(new Error('Exchange failed'));

        const response = await GET(createGetRequest({ code: 'spotify_code', state }));

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error).toBe('Could not complete OAuth flow');
      });
    });
  });

  describe('Init flow (provider param)', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        OAUTH_CALLBACK_URL: `https://example.com${oauthRoute}`,
        SPOTIFY_CLIENT_ID: 'test-spotify-client-id',
        STRAVA_CLIENT_ID: 'test-strava-client-id',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('redirects to console for invalid provider', async () => {
      const response = await GET(createGetRequest({ provider: 'invalid' }));

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe(`https://example.com${devConsoleRoute}`);
    });

    it('redirects to Strava OAuth URL for strava provider', async () => {
      const response = await GET(createGetRequest({ provider: 'strava' }));

      expect(response.status).toBe(307);
      const location = response.headers.get('Location');
      expect(location).toContain('https://www.strava.com/oauth/authorize');
      expect(location).toContain('client_id=test-strava-client-id');
      expect(location).toContain(
        'scope=read%2Cactivity%3Aread_all%2Cprofile%3Aread_all%2Cread_all',
      );
      expect(location).toContain('approval_prompt=force'); // Always forces consent dialog
      expect(mockSaveOauthState).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'strava',
        }),
      );
    });

    it('redirects to Spotify OAuth URL for spotify provider', async () => {
      const response = await GET(createGetRequest({ provider: 'spotify' }));

      expect(response.status).toBe(307);
      const location = response.headers.get('Location');
      expect(location).toContain('https://accounts.spotify.com/authorize');
      expect(location).toContain('client_id=test-spotify-client-id');
      expect(location).toContain('code_challenge='); // PKCE
      expect(location).toContain('show_dialog=true'); // Always forces consent dialog
      expect(mockSaveOauthState).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'spotify',
        }),
      );
    });
  });
});
