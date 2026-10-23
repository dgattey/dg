import { setupMockLifecycle } from '@dg/testing/mocks';
import { clearLastPlayedCache, fetchRecentlyPlayed } from '../fetchRecentlyPlayed';
import { getSpotifyClient } from '../spotifyClient';

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: jest.fn(),
}));

const CURRENTLY_PLAYING_PAYLOAD = {
  is_playing: true,
  item: {
    album: {
      external_urls: { spotify: 'https://open.spotify.com/album/a1' },
      href: 'https://api.spotify.com/v1/albums/a1',
      id: 'a1',
      images: [{ height: 640, url: 'https://i.scdn.co/image/a1.jpg', width: 640 }],
      name: 'Album 1',
      release_date: '2026-01-01',
      uri: 'spotify:album:a1',
    },
    artists: [
      {
        external_urls: { spotify: 'https://open.spotify.com/artist/ar1' },
        href: 'https://api.spotify.com/v1/artists/ar1',
        id: 'ar1',
        name: 'Artist 1',
        uri: 'spotify:artist:ar1',
      },
    ],
    duration_ms: 180_000,
    external_urls: { spotify: 'https://open.spotify.com/track/t1' },
    href: 'https://api.spotify.com/v1/tracks/t1',
    id: 't1',
    name: 'Live Song',
    uri: 'spotify:track:t1',
  },
  progress_ms: 42_000,
};

const RECENTLY_PLAYED_PAYLOAD = {
  items: [
    {
      played_at: '2026-10-22T20:00:00.000Z',
      track: CURRENTLY_PLAYING_PAYLOAD.item,
    },
  ],
};

describe('fetchRecentlyPlayed', () => {
  setupMockLifecycle();

  const mockGet = jest.fn();

  beforeEach(() => {
    clearLastPlayedCache();
    mockGet.mockReset();
    jest.mocked(getSpotifyClient).mockReturnValue({ get: mockGet });
  });

  it('returns the currently playing track when status is 200', async () => {
    mockGet.mockResolvedValueOnce({
      response: { json: async () => CURRENTLY_PLAYING_PAYLOAD },
      status: 200,
    });

    const track = await fetchRecentlyPlayed();

    expect(track?.name).toBe('Live Song');
    expect(track?.isPlaying).toBe(true);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('me/player/currently-playing');
  });

  it('caches the recently-played fallback when playback is idle (204) to avoid a second Spotify call on every poll', async () => {
    mockGet
      .mockResolvedValueOnce({
        response: { json: async () => null },
        status: 204,
      })
      .mockResolvedValueOnce({
        response: { json: async () => RECENTLY_PLAYED_PAYLOAD },
        status: 200,
      })
      .mockResolvedValueOnce({
        response: { json: async () => null },
        status: 204,
      });

    const first = await fetchRecentlyPlayed();
    const second = await fetchRecentlyPlayed();

    expect(first?.name).toBe('Live Song');
    expect(second?.name).toBe('Live Song');
    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'me/player/currently-playing');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'me/player/recently-played?limit=1');
    expect(mockGet).toHaveBeenNthCalledWith(3, 'me/player/currently-playing');
  });
});
