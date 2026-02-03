/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../route';

jest.mock('@dg/services/spotify/runOauthFlow', () => ({
  OAUTH_STATE_TYPE: 'spotifyOauthFlow',
}));

jest.mock('@dg/services/strava/runOauthFlow', () => ({
  OAUTH_STATE_TYPE: 'stravaOauthFlow',
}));

jest.mock('../../../../services/strava', () => ({
  exchangeCodeForToken: jest.fn(),
}));

jest.mock('../../../../services/spotify', () => ({
  exchangeSpotifyCodeForToken: jest.fn(),
}));

import * as spotifyService from '../../../../services/spotify';
import * as stravaService from '../../../../services/strava';

const mockExchangeStravaCode = jest.mocked(stravaService.exchangeCodeForToken);
const mockExchangeSpotifyCode = jest.mocked(spotifyService.exchangeSpotifyCodeForToken);

const createGetRequest = (params: Record<string, string>) => {
  const url = new URL('https://example.com/api/oauth');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, { method: 'GET' });
};

describe('OAuth Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when code is missing', async () => {
    const response = await GET(createGetRequest({ state: 'stravaOauthFlow' }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Missing authorization code');
  });

  it('returns 400 for unknown state', async () => {
    const response = await GET(createGetRequest({ code: 'auth_code', state: 'unknown' }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Unknown OAuth provider');
  });

  describe('Strava', () => {
    it('exchanges code for token and redirects to /dev', async () => {
      mockExchangeStravaCode.mockResolvedValue('<html>Strava Success</html>');

      const response = await GET(
        createGetRequest({ code: 'strava_code', state: 'stravaOauthFlow' }),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('https://example.com/dev');
      expect(mockExchangeStravaCode).toHaveBeenCalledWith('strava_code');
      expect(mockExchangeSpotifyCode).not.toHaveBeenCalled();
    });

    it('returns 500 when token exchange fails', async () => {
      mockExchangeStravaCode.mockRejectedValue(new Error('Exchange failed'));

      const response = await GET(
        createGetRequest({ code: 'strava_code', state: 'stravaOauthFlow' }),
      );

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Could not complete OAuth flow');
    });
  });

  describe('Spotify', () => {
    it('exchanges code for token and redirects to /dev', async () => {
      mockExchangeSpotifyCode.mockResolvedValue('<html>Spotify Success</html>');

      const response = await GET(
        createGetRequest({ code: 'spotify_code', state: 'spotifyOauthFlow' }),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('https://example.com/dev');
      expect(mockExchangeSpotifyCode).toHaveBeenCalledWith('spotify_code');
      expect(mockExchangeStravaCode).not.toHaveBeenCalled();
    });

    it('returns 500 when token exchange fails', async () => {
      mockExchangeSpotifyCode.mockRejectedValue(new Error('Exchange failed'));

      const response = await GET(
        createGetRequest({ code: 'spotify_code', state: 'spotifyOauthFlow' }),
      );

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Could not complete OAuth flow');
    });
  });
});
