import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { loadMoreMusicHistory } from '../../../../services/music.actions';
import { MusicHistorySkeleton } from '../MusicHistorySkeleton';
import { MusicInfiniteScroll } from '../MusicInfiniteScroll';

jest.mock('../../../../services/music.actions', () => ({
  loadMoreMusicHistory: jest.fn(),
}));

const SERVER_TIME = Date.parse('2026-08-04T14:00:00.000Z');

function play(album: string, track: string, minute: number): HistoryTrack {
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    playedAt: `2026-08-04T12:${String(minute).padStart(2, '0')}:00.000Z`,
    trackId: `track-${track}`,
    trackName: track,
    url: `https://open.spotify.com/track/${track}`,
  };
}

function TestWrapper({ children }: { children: ReactNode }) {
  return <ServerTimeProvider serverTime={SERVER_TIME}>{children}</ServerTimeProvider>;
}

const intersectionRect = {
  bottom: 1,
  height: 1,
  left: 0,
  right: 1,
  toJSON: () => ({}),
  top: 0,
  width: 1,
  x: 0,
  y: 0,
};

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '200px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];

  constructor(readonly callback: IntersectionObserverCallback) {
    observers.push(this);
  }

  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

let observers: Array<MockIntersectionObserver> = [];

function intersectLatestObserver() {
  const observer = observers.at(-1);
  expect(observer).toBeDefined();
  if (!observer) {
    return;
  }
  const entry = {
    boundingClientRect: intersectionRect,
    intersectionRatio: 1,
    intersectionRect,
    isIntersecting: true,
    rootBounds: null,
    target: document.createElement('div'),
    time: 0,
  } satisfies IntersectionObserverEntry;
  observer.callback([entry], observer);
}

describe('MusicInfiniteScroll', () => {
  beforeEach(() => {
    observers = [];
    jest.mocked(loadMoreMusicHistory).mockReset();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'IntersectionObserver');
  });

  it('keeps collage rendering through two sequential loads', async () => {
    type LoadResult = Awaited<ReturnType<typeof loadMoreMusicHistory>>;
    let resolveFirstPage = (_result: LoadResult) => {};
    const firstPage = new Promise<LoadResult>((resolve) => {
      resolveFirstPage = resolve;
    });
    jest
      .mocked(loadMoreMusicHistory)
      .mockReturnValueOnce(firstPage)
      .mockResolvedValueOnce({
        nextCursor: null,
        tracks: [play('Clay', 'Solo', 3)],
      });

    const { container } = render(
      <MusicInfiniteScroll
        initialCursor="cursor-1"
        initialTracks={[play('Bloom', 'One', 1)]}
        surface="collage"
      />,
      { wrapper: TestWrapper },
    );

    act(() => intersectLatestObserver());
    expect(screen.getByText('Loading more plays…')).toBeInTheDocument();

    await act(async () => {
      resolveFirstPage({
        nextCursor: 'cursor-2',
        tracks: [play('Bloom', 'Two', 2)],
      });
      await firstPage;
    });

    await waitFor(() => {
      expect(screen.getByText('2 tracks')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-role="collage-music-grid"]')).not.toBeNull();

    act(() => intersectLatestObserver());

    await waitFor(() => {
      expect(loadMoreMusicHistory).toHaveBeenNthCalledWith(2, 'cursor-2');
      expect(screen.getByRole('link', { name: /Solo/ })).toHaveTextContent('SoloClay artist');
    });
    expect(container.querySelectorAll('[data-image-treatment="full-color"]')).toHaveLength(2);
    expect(container.querySelector('[data-role="collage-music-end"]')).toHaveTextContent(
      'That’s everything3 plays',
    );
  });

  it('uses a paper card for the collage empty state without changing the classic copy', () => {
    const view = render(
      <MusicInfiniteScroll initialCursor={null} initialTracks={[]} surface="collage" />,
      { wrapper: TestWrapper },
    );

    expect(view.container.querySelector('[data-role="collage-music-empty"]')).toHaveTextContent(
      'No listening history yet.Spotify',
    );

    view.rerender(
      <TestWrapper>
        <MusicInfiniteScroll initialCursor={null} initialTracks={[]} />
      </TestWrapper>,
    );

    expect(screen.getByText('No listening history yet.')).toBeInTheDocument();
    expect(view.container.querySelector('[data-role="collage-music-empty"]')).toBeNull();
  });

  it('uses paper date tags and cards only for the collage skeleton', () => {
    const view = render(<MusicHistorySkeleton surface="collage" />);

    expect(screen.getByRole('status', { name: 'Loading listening history' })).toBeInTheDocument();
    expect(
      view.container.querySelectorAll('[data-role="collage-music-skeleton-grid"]'),
    ).toHaveLength(2);
    expect(view.container.querySelectorAll('[data-site-surface="collage"]')).toHaveLength(2);

    view.rerender(<MusicHistorySkeleton />);

    expect(view.container.querySelector('[data-role="collage-music-skeleton"]')).toBeNull();
    expect(view.container.querySelector('[data-site-surface="collage"]')).toBeNull();
  });
});
