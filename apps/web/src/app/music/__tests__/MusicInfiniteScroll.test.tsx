import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { loadMoreMusicHistory } from '../../../services/music.actions';
import { MusicInfiniteScroll } from '../MusicInfiniteScroll';

jest.mock('../../../services/music.actions', () => ({
  loadMoreMusicHistory: jest.fn(),
}));

function play(name: string, playedAt = '2026-08-04T12:00:00.000Z'): HistoryTrack {
  return {
    albumId: `album-${name}`,
    albumImageUrl: `https://i.scdn.co/image/${name}`,
    albumName: name,
    albumUrl: `https://open.spotify.com/album/${name}`,
    artistNames: `${name} artist`,
    newArtist: null,
    playedAt,
    trackId: `track-${name}`,
    trackName: name,
    url: `https://open.spotify.com/track/${name}`,
  };
}

/** `count` consecutive plays of one album early this morning, newest first. */
function albumRun(name: string, count: number, startMinute: number) {
  return Array.from({ length: count }, (_, index) =>
    play(
      name,
      new Date(Date.parse('2026-08-04T11:59:00Z') - (startMinute + index) * 60_000).toISOString(),
    ),
  );
}

function intersect(observer: NonNullable<typeof captured>) {
  return observer.callback(
    [
      {
        boundingClientRect: new DOMRect(),
        intersectionRatio: 1,
        intersectionRect: new DOMRect(),
        isIntersecting: true,
        rootBounds: null,
        target: document.createElement('div'),
        time: 0,
      },
    ],
    observer.instance,
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ServerTimeProvider serverTime={Date.parse('2026-08-04T14:00:00Z')}>
      {children}
    </ServerTimeProvider>
  );
}

let captured:
  | { callback: IntersectionObserverCallback; instance: IntersectionObserver }
  | undefined;
const activeObservers = new Set<IntersectionObserver>();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '200px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  constructor(callback: IntersectionObserverCallback) {
    captured = { callback, instance: this };
  }
  disconnect() {
    activeObservers.delete(this);
  }
  observe() {
    activeObservers.add(this);
  }
  takeRecords() {
    return [];
  }
  unobserve() {}
}

describe('MusicInfiniteScroll', () => {
  beforeEach(() => {
    jest.mocked(loadMoreMusicHistory).mockReset();
    captured = undefined;
    activeObservers.clear();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'IntersectionObserver');
  });

  it('loads and renders the next page when observed', async () => {
    jest.mocked(loadMoreMusicHistory).mockResolvedValue({
      nextCursor: null,
      tracks: [play('Clay')],
    });
    render(<MusicInfiniteScroll initialCursor="cursor-1" initialTracks={[play('Bloom')]} />, {
      wrapper: Wrapper,
    });
    invariant(captured, 'Expected an intersection observer');
    const observer = captured;
    act(() => {
      intersect(observer);
    });
    await waitFor(() => expect(loadMoreMusicHistory).toHaveBeenCalledWith('cursor-1'));
    expect(await screen.findByRole('link', { name: /Clay/ })).toBeInTheDocument();
  });

  it('groups the first page and a loaded page as one history', async () => {
    jest.mocked(loadMoreMusicHistory).mockResolvedValue({
      nextCursor: null,
      tracks: [
        ...albumRun('CTRL ESCAPE', 2, 24),
        play('The Greatest Show On Earth', '2026-08-04T11:00:00Z'),
        play('Open Late', '2026-08-04T10:00:00Z'),
        play('USB', '2026-08-03T12:00:00Z'),
      ],
    });
    render(
      <MusicInfiniteScroll
        initialCursor="cursor-1"
        initialTracks={[...albumRun('Mat Kearney', 11, 0), ...albumRun('CTRL ESCAPE', 13, 11)]}
      />,
      { wrapper: Wrapper },
    );
    invariant(captured, 'Expected an intersection observer');
    const observer = captured;
    await act(() => intersect(observer));

    await screen.findByRole('link', { name: /USB/ });
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Today',
      'This week',
    ]);
    const today = within(screen.getByRole('region', { name: 'Today' }));
    expect(today.getAllByRole('link', { name: /CTRL ESCAPE/ })).toHaveLength(1);
    expect(today.getByRole('link', { name: /CTRL ESCAPE/ })).toHaveTextContent('15 tracks');
  });

  it('stops observing a cursor whose page failed to load', async () => {
    jest.mocked(loadMoreMusicHistory).mockRejectedValue(new Error('offline'));
    render(<MusicInfiniteScroll initialCursor="cursor-1" initialTracks={[play('Bloom')]} />, {
      wrapper: Wrapper,
    });
    invariant(captured, 'Expected an intersection observer');
    const failingObserver = captured;
    await act(() => intersect(failingObserver));

    expect(loadMoreMusicHistory).toHaveBeenCalledTimes(1);
    expect(activeObservers.size).toBe(0);
  });

  it('renders the empty state', () => {
    render(<MusicInfiniteScroll initialCursor={null} initialTracks={[]} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('status')).toHaveTextContent('No listening history yet.');
  });
});
