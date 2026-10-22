import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import { NowPlayingProvider, PublishNowPlaying } from '../NowPlayingContext';
import { SpotifyCollageCard } from '../SpotifyCollageCard';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
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

describe('NowPlayingProvider', () => {
  it('updates both the header card and the body card when the live track streams in', () => {
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={STALE} />
        <SpotifyCollageCard track={STALE} />
        <PublishNowPlaying track={FRESH} />
      </NowPlayingProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
  });

  it('follows the live publisher when the server sends the next track', () => {
    const { rerender } = render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={STALE} />
        <SpotifyCollageCard track={STALE} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');
    expect(screen.getByTestId('card')).toHaveTextContent('Track stale');

    rerender(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={STALE} />
        <SpotifyCollageCard track={STALE} />
        <PublishNowPlaying track={FRESH} />
      </NowPlayingProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
  });

  it('keeps the header on its own track outside the provider', () => {
    render(<SpotifyHeaderCard track={STALE} />);

    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');
  });

  it('switches the shell track to the live one without the shell overwriting it', () => {
    const { rerender } = render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={STALE} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');

    rerender(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={{ ...STALE }} />
        <PublishNowPlaying track={FRESH} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');

    rerender(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={{ ...STALE }} />
        <PublishNowPlaying track={FRESH} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
  });

  it('shows the live track when the shell had none', () => {
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={null} />
        <PublishNowPlaying track={FRESH} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
  });

  it('renders nothing without any track', () => {
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={null} />
      </NowPlayingProvider>,
    );
    expect(screen.queryByTestId('compact')).not.toBeInTheDocument();
  });
});
