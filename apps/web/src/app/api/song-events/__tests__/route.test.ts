/**
 * @jest-environment node
 */
import type { Track } from '@dg/content-models/spotify/Track';
import { GET } from '../route';

// Mock the fetchRecentlyPlayed function
jest.mock('@dg/services/spotify/fetchRecentlyPlayed', () => ({
  fetchRecentlyPlayed: jest.fn(),
}));

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';

const mockFetchRecentlyPlayed = jest.mocked(fetchRecentlyPlayed);

// Helper to create a mock track
const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album/123' },
    href: 'https://api.spotify.com/v1/albums/123',
    id: 'album123',
    images: [{ height: 640, url: 'https://example.com/album.jpg', width: 640 }],
    name: 'Test Album',
    releaseDate: '2024-01-01',
    uri: 'spotify:album:123',
  },
  albumImage: { height: 640, url: 'https://example.com/album.jpg', width: 640 },
  artists: [
    {
      externalUrls: { spotify: 'https://open.spotify.com/artist/456' },
      href: 'https://api.spotify.com/v1/artists/456',
      id: 'artist456',
      name: 'Test Artist',
      uri: 'spotify:artist:456',
    },
  ],
  durationMs: 180000, // 3 minutes
  externalUrls: { spotify: 'https://open.spotify.com/track/789' },
  href: 'https://api.spotify.com/v1/tracks/789',
  id: 'track789',
  isPlaying: true,
  name: 'Test Track',
  progressMs: 60000, // 1 minute in
  uri: 'spotify:track:789',
  ...overrides,
});

// Helper to read SSE events from a response stream
async function readSSEEvents(
  response: Response,
  maxEvents = 1,
): Promise<Array<{ event: string; data: unknown }>> {
  const events: Array<{ event: string; data: unknown }> = [];
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (events.length < maxEvents) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE format: "event: <type>\ndata: <json>\n\n"
    const eventMatches = buffer.matchAll(/event: (\w+)\ndata: (.+?)\n\n/g);
    for (const match of eventMatches) {
      const eventType = match[1];
      const eventData = match[2];
      if (eventType && eventData) {
        events.push({
          data: JSON.parse(eventData),
          event: eventType,
        });
      }
    }

    // Clear processed events from buffer
    buffer = buffer.replace(/event: \w+\ndata: .+?\n\n/g, '');
  }

  reader.cancel();
  return events;
}

describe('Song Events SSE Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET handler', () => {
    it('returns correct SSE headers', async () => {
      mockFetchRecentlyPlayed.mockResolvedValue(null);

      const response = await GET();

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(response.headers.get('X-Accel-Buffering')).toBe('no');
    });

    it('sends connected event with track info when playing', async () => {
      const mockTrack = createMockTrack({
        durationMs: 180000,
        isPlaying: true,
        progressMs: 60000,
      });
      mockFetchRecentlyPlayed.mockResolvedValue(mockTrack);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      expect(events).toHaveLength(1);
      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.event).toBe('connected');
      expect(firstEvent?.data).toEqual({
        isPlaying: true,
        songEndTimeoutMs: 120500, // (180000 - 60000) + 500ms buffer
        trackId: 'track789',
      });
    });

    it('sends connected event with null timeout when not playing', async () => {
      const mockTrack = createMockTrack({
        isPlaying: false,
        playedAt: '2024-01-01T12:00:00Z',
      });
      mockFetchRecentlyPlayed.mockResolvedValue(mockTrack);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      expect(events).toHaveLength(1);
      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.event).toBe('connected');
      expect(firstEvent?.data).toEqual({
        isPlaying: false,
        songEndTimeoutMs: null,
        trackId: 'track789',
      });
    });

    it('sends connected event with null values when no track', async () => {
      mockFetchRecentlyPlayed.mockResolvedValue(null);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      expect(events).toHaveLength(1);
      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.event).toBe('connected');
      expect(firstEvent?.data).toEqual({
        isPlaying: false,
        songEndTimeoutMs: null,
        trackId: null,
      });
    });

    it('calculates correct timeout when song is almost done', async () => {
      const mockTrack = createMockTrack({
        durationMs: 180000,
        isPlaying: true,
        progressMs: 179000, // Only 1 second left
      });
      mockFetchRecentlyPlayed.mockResolvedValue(mockTrack);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.data).toEqual({
        isPlaying: true,
        songEndTimeoutMs: 1500, // 1000ms remaining + 500ms buffer
        trackId: 'track789',
      });
    });

    it('handles missing progressMs gracefully', async () => {
      const mockTrack = createMockTrack({
        durationMs: 180000,
        isPlaying: true,
        progressMs: undefined,
      });
      mockFetchRecentlyPlayed.mockResolvedValue(mockTrack);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.data).toEqual({
        isPlaying: true,
        songEndTimeoutMs: null,
        trackId: 'track789',
      });
    });

    it('handles missing durationMs gracefully', async () => {
      const mockTrack = createMockTrack({
        durationMs: undefined,
        isPlaying: true,
        progressMs: 60000,
      });
      mockFetchRecentlyPlayed.mockResolvedValue(mockTrack);

      const response = await GET();
      const events = await readSSEEvents(response, 1);

      const firstEvent = events[0];
      expect(firstEvent).toBeDefined();
      expect(firstEvent?.data).toEqual({
        isPlaying: true,
        songEndTimeoutMs: null,
        trackId: 'track789',
      });
    });
  });
});
