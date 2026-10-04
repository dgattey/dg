import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NowPlayingProvider } from '../NowPlayingContext';
import { SpotifyCardWithGradient } from '../SpotifyCardWithGradient';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('../SpotifyCardScrollTracker', () => ({
  NOW_PLAYING_CARD_ID: 'now-playing',
  SpotifyCardScrollTracker: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('../TrackListing', () => ({
  TrackListing: ({ track, variant = 'card' }: { track: Track; variant?: string }) => (
    <div data-testid={variant}>{track.name}</div>
  ),
}));

const makeTrack = (id: string): Track => {
  const core = {
    externalUrls: { spotify: `https://open.spotify.com/${id}` },
    href: `https://api.spotify.com/${id}`,
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
  };
  return {
    ...core,
    album: { ...core, images: [], name: `Album ${id}`, releaseDate: '2026-01-01' },
    albumImage: { height: 640, url: `https://images.test/${id}.jpg`, width: 640 },
    artists: [{ ...core, id: `artist-${id}`, name: `Artist ${id}` }],
    isPlaying: true,
  };
};

const STALE = makeTrack('stale');
const FRESH = makeTrack('fresh');

beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe('NowPlayingProvider', () => {
  it('shows the page widget track in the layout header card', () => {
    // The header keeps the first load's track across client navigations, while
    // the page widget renders the track fetched for the current page.
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard surface="collage" track={STALE} />
        <SpotifyCardWithGradient surface="collage" track={FRESH} />
      </NowPlayingProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
  });

  it('follows the widget when the server sends the next track', () => {
    const header = <SpotifyHeaderCard surface="collage" track={STALE} />;
    const { rerender } = render(
      <NowPlayingProvider>
        {header}
        <SpotifyCardWithGradient surface="collage" track={STALE} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');

    rerender(
      <NowPlayingProvider>
        {header}
        <SpotifyCardWithGradient surface="collage" track={FRESH} />
      </NowPlayingProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
  });

  it('keeps the header on its own track outside the provider', () => {
    render(<SpotifyHeaderCard track={STALE} />);

    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');
  });
});
