import { renderHook } from '@testing-library/react';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock EventSource
class MockEventSource {
  static instances: Array<MockEventSource> = [];
  url: string;
  listeners: Map<string, Array<(event: MessageEvent) => void>> = new Map();
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1;
    }, 0);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2;
  }

  // Test helper to emit events
  emit(type: string, data: unknown) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const event = new MessageEvent(type, {
        data: JSON.stringify(data),
      });
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  // Test helper to trigger error
  triggerError() {
    const listeners = this.listeners.get('error');
    if (listeners) {
      for (const listener of listeners) {
        listener(new MessageEvent('error'));
      }
    }
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static getLatest(): MockEventSource {
    const latest = MockEventSource.instances[MockEventSource.instances.length - 1];
    if (!latest) {
      throw new Error('No MockEventSource instances created');
    }
    return latest;
  }
}

// Replace global EventSource with mock
Object.defineProperty(global, 'EventSource', {
  value: MockEventSource,
  writable: true,
});

// Import hook after mocks are set up
import { useSongChangeEvents } from '../useSongChangeEvents';

describe('useSongChangeEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    MockEventSource.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates EventSource connection on mount', () => {
    renderHook(() => useSongChangeEvents());

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.getLatest().url).toBe('/api/song-events');
  });

  it('closes EventSource connection on unmount', () => {
    const { unmount } = renderHook(() => useSongChangeEvents());

    const eventSource = MockEventSource.getLatest();
    unmount();

    expect(eventSource.readyState).toBe(2); // CLOSED
  });

  it('triggers router.refresh() on song-ended event', () => {
    renderHook(() => useSongChangeEvents());

    const eventSource = MockEventSource.getLatest();
    eventSource.emit('song-ended', {
      newTrackId: 'newTrack123',
      previousTrackId: 'track789',
      shouldRefresh: true,
      songChanged: true,
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when shouldRefresh is false', () => {
    renderHook(() => useSongChangeEvents());

    const eventSource = MockEventSource.getLatest();
    eventSource.emit('song-ended', {
      newTrackId: 'track789',
      previousTrackId: 'track789',
      shouldRefresh: false,
      songChanged: false,
    });

    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('reconnects after song-ended event', () => {
    renderHook(() => useSongChangeEvents());

    const firstEventSource = MockEventSource.getLatest();
    firstEventSource.emit('song-ended', {
      newTrackId: 'newTrack123',
      previousTrackId: 'track789',
      shouldRefresh: true,
      songChanged: true,
    });

    // Fast-forward past reconnect delay
    jest.advanceTimersByTime(2000);

    expect(MockEventSource.instances).toHaveLength(2);
  });

  it('reconnects after timeout event', () => {
    renderHook(() => useSongChangeEvents());

    const firstEventSource = MockEventSource.getLatest();
    firstEventSource.emit('timeout', {
      message: 'Connection timeout, please reconnect',
    });

    // Fast-forward past reconnect delay
    jest.advanceTimersByTime(2000);

    expect(MockEventSource.instances).toHaveLength(2);
  });

  it('reconnects on error with exponential backoff', () => {
    renderHook(() => useSongChangeEvents());

    const eventSource = MockEventSource.getLatest();
    eventSource.triggerError();

    // Should reconnect after delay
    jest.advanceTimersByTime(2000);
    expect(MockEventSource.instances).toHaveLength(2);
  });

  it('stops reconnecting after max attempts', () => {
    renderHook(() => useSongChangeEvents());

    // Trigger 5 errors (max attempts)
    for (let i = 0; i < 5; i++) {
      const eventSource = MockEventSource.getLatest();
      eventSource.triggerError();
      jest.advanceTimersByTime(2000);
    }

    // Should have created 5 instances total (1 initial + 4 reconnects)
    // The 5th error shouldn't trigger a new connection
    const instanceCount = MockEventSource.instances.length;
    const lastEventSource = MockEventSource.getLatest();
    lastEventSource.triggerError();
    jest.advanceTimersByTime(2000);

    expect(MockEventSource.instances.length).toBe(instanceCount);
  });

  it('resets reconnect attempts on successful connection', () => {
    renderHook(() => useSongChangeEvents());

    // Trigger some errors
    for (let i = 0; i < 3; i++) {
      const eventSource = MockEventSource.getLatest();
      eventSource.triggerError();
      jest.advanceTimersByTime(2000);
    }

    // Now emit connected event to reset attempts
    const eventSource = MockEventSource.getLatest();
    eventSource.emit('connected', {
      isPlaying: true,
      songEndTimeoutMs: 60000,
      trackId: 'track123',
    });

    // Should be able to handle more errors now
    for (let i = 0; i < 3; i++) {
      const currentEventSource = MockEventSource.getLatest();
      currentEventSource.triggerError();
      jest.advanceTimersByTime(2000);
    }

    // Should still be creating new instances
    expect(MockEventSource.instances.length).toBeGreaterThan(6);
  });

  it('handles malformed JSON in event data gracefully', () => {
    renderHook(() => useSongChangeEvents());

    const eventSource = MockEventSource.getLatest();

    // Override emit to send invalid JSON
    const listeners = eventSource.listeners.get('song-ended');
    if (listeners) {
      const event = new MessageEvent('song-ended', {
        data: 'not valid json',
      });
      for (const listener of listeners) {
        listener(event);
      }
    }

    // Should still refresh and attempt to reconnect
    expect(mockRefresh).toHaveBeenCalled();
  });
});
