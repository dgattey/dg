import type { Track } from '@dg/content-models/spotify/Track';
import { act, render, screen } from '@testing-library/react';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../TrackListing', () => ({
  TrackListing: ({ shouldAnimate }: { shouldAnimate: boolean }) => (
    <div data-animating={String(shouldAnimate)} data-testid="compact" />
  ),
}));

const TRACK: Track = {
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album' },
    href: 'https://api.spotify.com/album',
    id: 'album',
    images: [],
    name: 'Album',
    releaseDate: '2026-01-01',
    uri: 'spotify:album:album',
  },
  albumImage: { height: 640, url: 'https://images.test/album.jpg', width: 640 },
  artists: [],
  externalUrls: { spotify: 'https://open.spotify.com/track' },
  href: 'https://api.spotify.com/track',
  id: 'track',
  isPlaying: true,
  name: 'Perfect Light',
  uri: 'spotify:track:track',
};

/** Reports an element in view while it's attached, the way a browser sees a sticky header. */
class AttachedElementObserver {
  static instances: Array<AttachedElementObserver> = [];
  private readonly elements = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    AttachedElementObserver.instances.push(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  disconnect() {
    this.elements.clear();
  }

  report() {
    const entries = [...this.elements].map(
      (target) => ({ isIntersecting: target.isConnected, target }) as IntersectionObserverEntry,
    );
    if (entries.length) {
      this.callback(entries, this as unknown as IntersectionObserver);
    }
  }
}

const reportIntersections = () =>
  act(() => {
    for (const observer of AttachedElementObserver.instances) {
      observer.report();
    }
  });

beforeEach(() => {
  AttachedElementObserver.instances = [];
  window.IntersectionObserver = AttachedElementObserver as unknown as typeof IntersectionObserver;
});

describe('SpotifyHeaderCard', () => {
  it.each([
    ['/music', '/reading'],
    ['/reading', '/music'],
  ])('keeps animating a playing track after navigating from %s to %s', (from, to) => {
    mockPathname = from;
    const { rerender } = render(<SpotifyHeaderCard track={TRACK} />);
    reportIntersections();
    expect(screen.getByTestId('compact')).toHaveAttribute('data-animating', 'true');

    mockPathname = to;
    rerender(<SpotifyHeaderCard track={TRACK} />);
    reportIntersections();

    expect(screen.getByTestId('compact')).toHaveAttribute('data-animating', 'true');
  });
});
