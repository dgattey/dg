import { safeParse } from 'valibot';
import { currentlyPlayingApiSchema } from '../CurrentlyPlaying';
import { recentlyPlayedApiSchema } from '../RecentlyPlayed';
import { trackApiSchema } from '../Track';

describe('spotify schemas', () => {
  const track = {
    album: {
      external_urls: { spotify: 'https://open.spotify.com/album/2' },
      href: 'https://api.spotify.com/v1/albums/2',
      id: '2',
      images: [{ height: 640, url: 'https://example.com/cover.jpg', width: 640 }],
      name: 'Album',
      release_date: '2020-01-01',
      uri: 'spotify:album:2',
    },
    artists: [
      {
        external_urls: { spotify: 'https://open.spotify.com/artist/1' },
        href: 'https://api.spotify.com/v1/artists/1',
        id: '1',
        name: 'Artist',
        uri: 'spotify:artist:1',
      },
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/123' },
    href: 'https://api.spotify.com/v1/tracks/123',
    id: '123',
    name: 'Test Track',
    uri: 'spotify:track:123',
  };

  it('parses track payloads', () => {
    expect(safeParse(trackApiSchema, track).success).toBe(true);
  });

  it('parses currently playing payloads', () => {
    const input = {
      is_playing: true,
      item: track,
      progress_ms: 12345,
    };

    expect(safeParse(currentlyPlayingApiSchema, input).success).toBe(true);
  });

  it('parses recently played payloads', () => {
    const input = {
      items: [{ played_at: '2024-01-01T00:00:00.000Z', track }],
      next: null,
    };

    expect(safeParse(recentlyPlayedApiSchema, input).success).toBe(true);
  });
});
