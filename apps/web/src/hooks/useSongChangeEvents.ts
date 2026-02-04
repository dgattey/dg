'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Delay before reconnecting after connection is closed or errors.
 */
const RECONNECT_DELAY_MS = 2000;

/**
 * Maximum number of reconnection attempts before giving up.
 */
const MAX_RECONNECT_ATTEMPTS = 5;

type SongEndedEvent = {
  shouldRefresh: boolean;
  previousTrackId: string | null;
  newTrackId: string | null;
  songChanged: boolean;
};

type TimeoutEvent = {
  message: string;
};

/**
 * Hook that subscribes to server-sent events for song changes.
 * When the server detects a song has ended, it sends an event and
 * this hook triggers a router refresh to fetch the new song data.
 *
 * This replaces the client-side timeout approach in PlaybackProgressBar,
 * moving the timing logic to the server for cleaner architecture.
 */
export function useSongChangeEvents() {
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Don't connect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    // Clean up any existing connection
    cleanup();

    const eventSource = new EventSource('/api/song-events');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', () => {
      // Reset reconnect attempts on successful connection
      reconnectAttemptsRef.current = 0;
    });

    eventSource.addEventListener('song-ended', (event) => {
      try {
        const data = JSON.parse(event.data) as SongEndedEvent;
        if (data.shouldRefresh) {
          router.refresh();
          // Reconnect to listen for the next song
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      } catch {
        // If parsing fails, refresh anyway and reconnect
        router.refresh();
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    });

    eventSource.addEventListener('timeout', (event) => {
      try {
        JSON.parse(event.data) as TimeoutEvent;
        // Server closed connection due to timeout, reconnect
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      } catch {
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    });

    eventSource.addEventListener('error', () => {
      cleanup();
      reconnectAttemptsRef.current += 1;
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    });
  }, [cleanup, router]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);
}
