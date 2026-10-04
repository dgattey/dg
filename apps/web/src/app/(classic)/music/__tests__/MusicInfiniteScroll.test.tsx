import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { loadMoreMusicHistory } from '../../../../services/music.actions';
import { MusicInfiniteScroll } from '../MusicInfiniteScroll';

jest.mock('../../../../services/music.actions', () => ({
  loadMoreMusicHistory: jest.fn(),
}));

function play(name: string): HistoryTrack {
  return {
    albumId: `album-${name}`,
    albumImageUrl: `https://i.scdn.co/image/${name}`,
    albumName: name,
    albumUrl: `https://open.spotify.com/album/${name}`,
    artistNames: `${name} artist`,
    playedAt: '2026-08-04T12:00:00.000Z',
    trackId: `track-${name}`,
    trackName: name,
    url: `https://open.spotify.com/track/${name}`,
  };
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

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '200px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  constructor(callback: IntersectionObserverCallback) {
    captured = { callback, instance: this };
  }
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

describe('MusicInfiniteScroll', () => {
  beforeEach(() => {
    jest.mocked(loadMoreMusicHistory).mockReset();
    captured = undefined;
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'IntersectionObserver');
  });

  it('loads and renders the next collage page when observed', async () => {
    jest.mocked(loadMoreMusicHistory).mockResolvedValue({
      nextCursor: null,
      tracks: [play('Clay')],
    });
    render(
      <MusicInfiniteScroll
        initialCursor="cursor-1"
        initialTracks={[play('Bloom')]}
        surface="collage"
      />,
      { wrapper: Wrapper },
    );
    invariant(captured, 'Expected an intersection observer');
    const observer = captured;
    act(() => {
      observer.callback(
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
    });
    await waitFor(() => expect(loadMoreMusicHistory).toHaveBeenCalledWith('cursor-1'));
    expect(await screen.findByRole('link', { name: /Clay/ })).toBeInTheDocument();
  });

  it('renders the collage empty state', () => {
    render(<MusicInfiniteScroll initialCursor={null} initialTracks={[]} surface="collage" />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('status')).toHaveTextContent('No listening history yet.');
  });
});
