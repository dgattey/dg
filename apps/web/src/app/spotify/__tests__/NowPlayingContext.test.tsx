import type { Track } from '@dg/content-models/spotify/Track';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, waitFor } from '@testing-library/react';
import { loadLatestSong } from '../../../services/spotify.actions';
import { FooterNowStrip } from '../../layouts/FooterNowStrip';
import { NowPlayingProvider, PublishNowPlaying } from '../NowPlayingContext';
import { SpotifyCollageCard } from '../SpotifyCollageCard';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../../services/spotify.actions', () => ({
  loadLatestSong: jest.fn(async () => null),
}));

jest.mock('../TrackListing', () => ({
  TrackListing: ({ track, variant = 'card' }: { track: Track; variant?: string }) => (
    <div data-testid={variant}>{track.name}</div>
  ),
}));

const makeTrack = (id: string, overrides: Partial<Track> = {}): Track => {
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
    albumImage: { height: 640, url: `https://i.scdn.co/image/${id}.jpg`, width: 640 },
    artists: [{ ...core, id: `artist-${id}`, name: `Artist ${id}` }],
    isPlaying: true,
    ...overrides,
  };
};

const STALE = makeTrack('stale');
const FRESH = makeTrack('fresh');
const NEXT_PLAYING = makeTrack('next');

beforeEach(() => {
  mockPathname = '/';
  jest.mocked(loadLatestSong).mockReset().mockResolvedValue(null);
});

describe('NowPlayingProvider', () => {
  it('updates the header card, homepage card, and footer strip when the live track streams in', () => {
    render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
          <PublishNowPlaying track={FRESH} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
    expect(
      screen.getByRole('link', { name: 'Playing Track fresh · Artist fresh' }),
    ).toHaveAttribute('href', 'https://open.spotify.com/fresh');
  });

  it('follows the live publisher when the server sends the next track', () => {
    const { rerender } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');
    expect(screen.getByTestId('card')).toHaveTextContent('Track stale');
    expect(
      screen.getByRole('link', { name: 'Playing Track stale · Artist stale' }),
    ).toBeInTheDocument();

    rerender(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
          <PublishNowPlaying track={FRESH} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
    expect(
      screen.getByRole('link', { name: 'Playing Track fresh · Artist fresh' }),
    ).toBeInTheDocument();
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

  it('shows the live track across header, home card, and footer strip when the shell had none', () => {
    render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={null} />
          <SpotifyCollageCard track={null} />
          <FooterNowStrip initialTrack={null} latestActivity={null} />
          <PublishNowPlaying track={FRESH} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
    expect(
      screen.getByRole('link', { name: 'Playing Track fresh · Artist fresh' }),
    ).toBeInTheDocument();
  });

  it('renders nothing without any track', () => {
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={null} />
      </NowPlayingProvider>,
    );
    expect(screen.queryByTestId('compact')).not.toBeInTheDocument();
  });

  it('refreshes all three surfaces on client route navigation and window focus', async () => {
    jest.mocked(loadLatestSong).mockResolvedValueOnce(FRESH).mockResolvedValueOnce(NEXT_PLAYING);

    const { rerender } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    mockPathname = '/music';
    rerender(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
      expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
      expect(
        screen.getByRole('link', { name: 'Playing Track fresh · Artist fresh' }),
      ).toBeInTheDocument();
    });

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track next');
      expect(screen.getByTestId('card')).toHaveTextContent('Track next');
      expect(
        screen.getByRole('link', { name: 'Playing Track next · Artist next' }),
      ).toBeInTheDocument();
    });
  });
});
