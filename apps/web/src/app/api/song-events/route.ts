import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';

/**
 * Buffer time to wait after song should end before sending refresh event.
 * Gives Spotify API time to update its state.
 */
const REFRESH_BUFFER_MS = 500;

/**
 * Interval for sending keep-alive comments to prevent connection timeout.
 */
const KEEP_ALIVE_INTERVAL_MS = 30000;

/**
 * Maximum connection time before the server closes it (5 minutes).
 * Clients should reconnect if they need to continue listening.
 */
const MAX_CONNECTION_MS = 5 * 60 * 1000;

/**
 * Encodes an SSE message with the given event type and data.
 */
const encodeSSE = (event: string, data: unknown): Uint8Array => {
  const encoder = new TextEncoder();
  const json = JSON.stringify(data);
  return encoder.encode(`event: ${event}\ndata: ${json}\n\n`);
};

/**
 * Encodes an SSE comment (keep-alive).
 */
const encodeComment = (): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(`: keep-alive\n\n`);
};

/**
 * SSE endpoint for song change notifications.
 *
 * Clients connect to this endpoint and receive events when they should
 * refresh to pick up song changes. The server tracks when the current
 * song should end and sends a 'song-ended' event at that time.
 */
export async function GET(): Promise<Response> {
  const track = await fetchRecentlyPlayed();

  // Calculate when the song should end (if playing)
  let songEndTimeoutMs: number | null = null;
  if (track?.isPlaying && track.durationMs && track.progressMs !== undefined) {
    const remainingMs = track.durationMs - track.progressMs;
    if (remainingMs > 0) {
      songEndTimeoutMs = remainingMs + REFRESH_BUFFER_MS;
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      let songEndTimeout: ReturnType<typeof setTimeout> | null = null;
      let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
      let maxConnectionTimeout: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (songEndTimeout) {
          clearTimeout(songEndTimeout);
          songEndTimeout = null;
        }
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        if (maxConnectionTimeout) {
          clearTimeout(maxConnectionTimeout);
          maxConnectionTimeout = null;
        }
      };

      // Send initial connection event with song timing info
      controller.enqueue(
        encodeSSE('connected', {
          isPlaying: track?.isPlaying ?? false,
          songEndTimeoutMs,
          trackId: track?.id ?? null,
        }),
      );

      // Set up keep-alive pings
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encodeComment());
        } catch {
          cleanup();
        }
      }, KEEP_ALIVE_INTERVAL_MS);

      // Set up song end notification if we know when it ends
      if (songEndTimeoutMs !== null) {
        songEndTimeout = setTimeout(async () => {
          try {
            // Fetch latest state to verify song has actually changed
            const newTrack = await fetchRecentlyPlayed();
            const songChanged = !track || newTrack?.id !== track.id || !newTrack?.isPlaying;

            controller.enqueue(
              encodeSSE('song-ended', {
                newTrackId: newTrack?.id ?? null,
                previousTrackId: track?.id ?? null,
                shouldRefresh: true,
                songChanged,
              }),
            );
          } catch {
            // If fetch fails, still notify client to refresh
            controller.enqueue(
              encodeSSE('song-ended', {
                newTrackId: null,
                previousTrackId: track?.id ?? null,
                shouldRefresh: true,
                songChanged: true,
              }),
            );
          }
        }, songEndTimeoutMs);
      }

      // Close connection after max time to prevent zombie connections
      maxConnectionTimeout = setTimeout(() => {
        try {
          controller.enqueue(
            encodeSSE('timeout', {
              message: 'Connection timeout, please reconnect',
            }),
          );
          cleanup();
          controller.close();
        } catch {
          cleanup();
        }
      }, MAX_CONNECTION_MS);
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
}
